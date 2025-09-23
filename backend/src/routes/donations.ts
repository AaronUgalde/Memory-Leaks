import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import {
    createAuthenticatedClient,
    isFinalizedGrant,
    isPendingGrant,
    Quote,
    IncomingPayment,
    OutgoingPayment,
    PendingGrant,
    Grant
} from '@interledger/open-payments';
import db from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// Interface para el estado de la donación
interface DonationState {
    incomingPayment?: IncomingPayment;
    quote?: Quote;
    outgoingPaymentGrantUrl?: string;
    outgoingPaymentGrantToken?: string;
    status: 'initiated' | 'quote_created' | 'grant_pending' | 'completed' | 'failed';
}

// Almacenamiento temporal de estados de donación (en producción usar Redis o DB)
const donationStates = new Map<string, DonationState>();

/**
 * GET /api/donations/wallet/:walletId
 * Obtener información de una wallet
 */
router.get('/wallet/:walletId',
    requireAuth,
    param('walletId').isUUID(),
    async (req: AuthRequest, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { walletId } = req.params;

            // Obtener wallet de la base de datos
            const walletResult = await db.query(
                'SELECT * FROM wallets WHERE id = $1',
                [walletId]
            );

            if (walletResult.rows.length === 0) {
                return res.status(404).json({ error: 'Wallet no encontrada' });
            }

            const wallet = walletResult.rows[0];

            // Crear cliente autenticado
            const privateKeyPath = path.join(process.cwd(), 'secrets', 'private.key');
            const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

            const client = await createAuthenticatedClient({
                walletAddressUrl: wallet.wallet_addres,
                privateKey: privateKey,
                keyId: process.env.OPEN_PAYMENTS_KEY_ID!
            });

            // Obtener información de la wallet address
            const walletAddress = await client.walletAddress.get({
                url: wallet.wallet_addres
            });

            return res.json({
                wallet: {
                    ...wallet,
                    walletAddressInfo: walletAddress
                }
            });
        } catch (error) {
            console.error('Error obteniendo wallet:', error);
            return res.status(500).json({ error: 'Error al obtener información de wallet' });
        }
    }
);

/**
 * POST /api/donations/initiate
 * Iniciar proceso de donación
 */
router.post('/initiate',
    requireAuth,
    [
        body('recipientUserId').isUUID(),
        body('amount').isNumeric().isFloat({ min: 0.01 }),
        body('currency').isString().isLength({ min: 3, max: 3 }),
        body('message').optional().isString(),
        body('isAnonymous').optional().isBoolean()
    ],
    async (req: AuthRequest, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { recipientUserId, amount, currency, message, isAnonymous } = req.body;
            const donorId = req.user!.user_id;

            // Obtener wallets del donor y recipient
            const donorWalletResult = await db.query(
                'SELECT * FROM wallets WHERE user_id = $1',
                [donorId]
            );

            const recipientWalletResult = await db.query(
                'SELECT * FROM wallets WHERE user_id = $1',
                [recipientUserId]
            );

            if (donorWalletResult.rows.length === 0) {
                return res.status(400).json({ error: 'No tienes una wallet configurada', user_id: donorId });
            }

            if (recipientWalletResult.rows.length === 0) {
                return res.status(400).json({ error: 'El destinatario no tiene una wallet configurada' });
            }

            const senderWalletAddress = donorWalletResult.rows[0].wallet_addres;
            const receiverWalletAddress = recipientWalletResult.rows[0].wallet_addres;

            // Crear cliente autenticado
            const client = await createAuthenticatedClient({
                walletAddressUrl: "https://ilp.interledger-test.dev/memory-leaks",
                privateKey: "private.key",
                keyId: "16d89d13-73c5-4cfd-a16b-e3e9ca9bce80"
            });

            // Obtener información de las wallet addresses
            const sendingWallet = await client.walletAddress.get({
                url: senderWalletAddress
            });

            const receivingWallet = await client.walletAddress.get({
                url: receiverWalletAddress
            });

            // Solicitar grant para crear incoming payment
            const incomingPaymentGrant = await client.grant.request(
                {
                    url: receivingWallet.authServer,
                },
                {
                    access_token: {
                        access: [
                            {
                                type: 'incoming-payment',
                                actions: ['create'],
                            }
                        ]
                    }
                }
            );

            if (!isFinalizedGrant(incomingPaymentGrant)) {
                return res.status(500).json({
                    error: 'No se pudo obtener el grant para el incoming payment'
                });
            }

            // Crear incoming payment
            const incomingPayment = await client.incomingPayment.create(
                {
                    url: receivingWallet.resourceServer,
                    accessToken: incomingPaymentGrant.access_token.value,
                },
                {
                    walletAddress: receivingWallet.id,
                    incomingAmount: {
                        assetCode: receivingWallet.assetCode,
                        assetScale: receivingWallet.assetScale,
                        value: String(Math.round(parseFloat(amount) * Math.pow(10, receivingWallet.assetScale))),
                    }
                }
            );

            // Generar ID único para esta donación
            const donationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Guardar estado inicial
            donationStates.set(donationId, {
                incomingPayment,
                status: 'initiated'
            });

            // Guardar donación en BD con estado pendiente
            const donationResult = await db.query(
                `INSERT INTO donations 
        (donor_id, recipient_id, amount, currency, wallet_addres_from, 
         wallet_addres_to, status, is_anonymous, message, transaction_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
                [
                    isAnonymous ? null : donorId,
                    recipientUserId,
                    amount,
                    currency,
                    senderWalletAddress,
                    receiverWalletAddress,
                    'pending',
                    isAnonymous || false,
                    message || null,
                    donationId
                ]
            );

            return res.json({
                success: true,
                donationId,
                donation: donationResult.rows[0],
                incomingPaymentUrl: incomingPayment.id,
                nextStep: 'create_quote'
            });

        } catch (error) {
            console.error('Error iniciando donación:', error);
            return res.status(500).json({ error: 'Error al iniciar donación' });
        }
    }
);

/**
 * POST /api/donations/:donationId/create-quote
 * Crear quote para la donación
 */
router.post('/:donationId/create-quote',
    requireAuth,
    param('donationId').isString(),
    async (req: AuthRequest, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { donationId } = req.params;
            const donationState = donationStates.get(donationId);

            if (!donationState || !donationState.incomingPayment) {
                return res.status(404).json({ error: 'Donación no encontrada o no iniciada' });
            }

            // Obtener donación de BD
            const donationResult = await db.query(
                'SELECT * FROM donations WHERE transaction_id = $1',
                [donationId]
            );

            if (donationResult.rows.length === 0) {
                return res.status(404).json({ error: 'Donación no encontrada en BD' });
            }

            const donation = donationResult.rows[0];

            // Crear cliente autenticado


            // Siempre partes desde __dirname (la carpeta del archivo actual)


            const client = await createAuthenticatedClient({
                walletAddressUrl: "https://ilp.interledger-test.dev/memory-leaks",
                privateKey: "private.key",
                keyId: "16d89d13-73c5-4cfd-a16b-e3e9ca9bce80"
            });

            // Obtener información de las wallets
            const sendingWallet = await client.walletAddress.get({
                url: donation.wallet_addres_from
            });

            const receivingWallet = await client.walletAddress.get({
                url: donation.wallet_addres_to
            });

            // Solicitar grant para crear quote
            const quoteGrant = await client.grant.request(
                {
                    url: receivingWallet.authServer,
                },
                {
                    access_token: {
                        access: [
                            {
                                type: 'quote',
                                actions: ['create'],
                            }
                        ]
                    }
                }
            );

            if (!isFinalizedGrant(quoteGrant)) {
                return res.status(500).json({
                    error: 'No se pudo obtener el grant para crear el quote'
                });
            }

            // Crear quote
            const quote = await client.quote.create(
                {
                    url: receivingWallet.resourceServer,
                    accessToken: quoteGrant.access_token.value,
                },
                {
                    walletAddress: sendingWallet.id,
                    receiver: donationState.incomingPayment.id,
                    method: 'ilp'
                }
            );

            // Actualizar estado
            donationState.quote = quote;
            donationState.status = 'quote_created';

            return res.json({
                success: true,
                quote: {
                    id: quote.id,
                    debitAmount: quote.debitAmount,
                    receiveAmount: quote.receiveAmount,
                    expiresAt: quote.expiresAt
                },
                nextStep: 'request_outgoing_grant'
            });

        } catch (error) {
            console.error('Error creando quote:', error);
            return res.status(500).json({ error: 'Error al crear quote' });
        }
    }
);

/**
 * POST /api/donations/:donationId/request-grant
 * Solicitar grant para outgoing payment (requiere interacción del usuario)
 */
router.post('/:donationId/request-grant',
    requireAuth,
    param('donationId').isString(),
    async (req: AuthRequest, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { donationId } = req.params;
            const donationState = donationStates.get(donationId);

            if (!donationState || !donationState.quote) {
                return res.status(404).json({ error: 'Quote no encontrado' });
            }

            // Obtener donación de BD
            const donationResult = await db.query(
                'SELECT * FROM donations WHERE transaction_id = $1',
                [donationId]
            );

            if (donationResult.rows.length === 0) {
                return res.status(404).json({ error: 'Donación no encontrada' });
            }

            const donation = donationResult.rows[0];

            // Crear cliente autenticado
            const client = await createAuthenticatedClient({
                walletAddressUrl: "https://ilp.interledger-test.dev/memory-leaks",
                privateKey: "private.key",
                keyId: "16d89d13-73c5-4cfd-a16b-e3e9ca9bce80"
            });


            const sendingWallet = await client.walletAddress.get({
                url: donation.wallet_addres_from
            });

            // Solicitar grant para outgoing payment con interacción
            const outgoingPaymentGrant = await client.grant.request(
                {
                    url: sendingWallet.authServer,
                },
                {
                    access_token: {
                        access: [
                            {
                                type: 'outgoing-payment',
                                actions: ['create'],
                                limits: {
                                    debitAmount: donationState.quote.debitAmount
                                },
                                identifier: sendingWallet.id
                            }
                        ]
                    },
                    interact: {
                        start: ['redirect'],
                    },
                }
            );

            // Verificar si el grant requiere interacción
            if (!isPendingGrant(outgoingPaymentGrant)) {
                return res.status(500).json({
                    error: 'Se esperaba un grant pendiente con interacción del usuario'
                });
            }

            // Guardar información del grant
            donationState.outgoingPaymentGrantUrl = outgoingPaymentGrant.continue.uri;
            donationState.outgoingPaymentGrantToken = outgoingPaymentGrant.continue.access_token.value;
            donationState.status = 'grant_pending';

            return res.json({
                success: true,
                requiresUserAction: true,
                interactionUrl: outgoingPaymentGrant.interact.redirect,
                message: 'Por favor, autoriza el pago en la URL proporcionada',
                nextStep: 'complete_donation'
            });

        } catch (error) {
            console.error('Error solicitando grant:', error);
            return res.status(500).json({ error: 'Error al solicitar autorización de pago' });
        }
    }
);

/**
 * POST /api/donations/:donationId/complete
 * Completar la donación después de autorización del usuario
 */
router.post('/:donationId/complete',
    requireAuth,
    param('donationId').isString(),
    async (req: AuthRequest, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { donationId } = req.params;
            const donationState = donationStates.get(donationId);

            if (!donationState || donationState.status !== 'grant_pending') {
                return res.status(400).json({
                    error: 'Donación no está en estado pendiente de autorización'
                });
            }

            // Obtener donación de BD
            const donationResult = await db.query(
                'SELECT * FROM donations WHERE transaction_id = $1',
                [donationId]
            );

            if (donationResult.rows.length === 0) {
                return res.status(404).json({ error: 'Donación no encontrada' });
            }

            const donation = donationResult.rows[0];

            // Crear cliente autenticado
            const client = await createAuthenticatedClient({
                walletAddressUrl: "https://ilp.interledger-test.dev/memory-leaks",
                privateKey: "private.key",
                keyId: "16d89d13-73c5-4cfd-a16b-e3e9ca9bce80"
            });


            const sendingWallet = await client.walletAddress.get({
                url: donation.wallet_addres_from
            });

            // Continuar con el grant después de autorización
            const finalizedGrant = await client.grant.continue({
                url: donationState.outgoingPaymentGrantUrl!,
                accessToken: donationState.outgoingPaymentGrantToken!,
            });

            if (!isFinalizedGrant(finalizedGrant)) {
                return res.status(400).json({
                    error: 'El grant no ha sido autorizado aún'
                });
            }

            // Crear outgoing payment
            const outgoingPayment = await client.outgoingPayment.create(
                {
                    url: sendingWallet.resourceServer,
                    accessToken: finalizedGrant.access_token.value,
                },
                {
                    walletAddress: sendingWallet.id,
                    quoteId: donationState.quote!.id,
                }
            );

            // Actualizar estado en BD
            await db.query(
                'UPDATE donations SET status = $1 WHERE transaction_id = $2',
                ['completed', donationId]
            );

            // Limpiar estado temporal
            donationStates.delete(donationId);

            return res.json({
                success: true,
                message: 'Donación completada exitosamente',
                outgoingPayment: {
                    id: outgoingPayment.id,
                    debitAmount: outgoingPayment.debitAmount,
                    receiveAmount: outgoingPayment.receiveAmount,
                    createdAt: outgoingPayment.createdAt
                }
            });

        } catch (error) {
            console.error('Error completando donación:', error);
            return res.status(500).json({ error: 'Error al completar la donación' });
        }
    }
);

/**
 * GET /api/donations/history
 * Obtener historial de donaciones del usuario
 */
router.get('/history',
    requireAuth,
    async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user!.user_id;
            const { type = 'all' } = req.query;

            let query = '';
            let params: any[] = [];

            if (type === 'sent') {
                query = `
          SELECT d.*, 
                 u.username as recipient_username, 
                 u.display_name as recipient_name
          FROM donations d
          JOIN users u ON d.recipient_id = u.id
          WHERE d.donor_id = $1
          ORDER BY d.created_at DESC
        `;
                params = [userId];
            } else if (type === 'received') {
                query = `
          SELECT d.*, 
                 u.username as donor_username, 
                 u.display_name as donor_name
          FROM donations d
          LEFT JOIN users u ON d.donor_id = u.id
          WHERE d.recipient_id = $1
          ORDER BY d.created_at DESC
        `;
                params = [userId];
            } else {
                query = `
          SELECT d.*, 
                 donor.username as donor_username,
                 donor.display_name as donor_name,
                 recipient.username as recipient_username,
                 recipient.display_name as recipient_name
          FROM donations d
          LEFT JOIN users donor ON d.donor_id = donor.id
          JOIN users recipient ON d.recipient_id = recipient.id
          WHERE d.donor_id = $1 OR d.recipient_id = $1
          ORDER BY d.created_at DESC
        `;
                params = [userId];
            }

            const result = await db.query(query, params);

            return res.json({
                donations: result.rows
            });

        } catch (error) {
            console.error('Error obteniendo historial:', error);
            return res.status(500).json({ error: 'Error al obtener historial' });
        }
    }
);

/**
 * GET /api/donations/stats
 * Obtener estadísticas de donaciones del usuario
 */
router.get('/stats',
    requireAuth,
    async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user!.user_id;

            const statsQuery = `
        SELECT 
          COALESCE(SUM(CASE WHEN donor_id = $1 THEN amount END), 0) as total_donated,
          COALESCE(SUM(CASE WHEN recipient_id = $1 THEN amount END), 0) as total_received,
          COUNT(CASE WHEN donor_id = $1 THEN 1 END) as donations_sent,
          COUNT(CASE WHEN recipient_id = $1 THEN 1 END) as donations_received
        FROM donations
        WHERE status = 'completed'
          AND (donor_id = $1 OR recipient_id = $1)
      `;

            const result = await db.query(statsQuery, [userId]);

            return res.json({
                stats: result.rows[0]
            });

        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
    }
);

export default router;