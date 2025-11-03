import { db } from '@/db';
import { transactions, bookings } from '@/db/schema';

async function main() {
    // First, check if we have bookings to reference
    const existingBookings = await db.select({ id: bookings.id }).from(bookings).limit(15);
    
    if (existingBookings.length === 0) {
        console.log('⚠️ No bookings found. Please seed bookings table first.');
        console.log('Run: npm run db:seed:bookings');
        return;
    }

    const bookingIds = existingBookings.map(b => b.id);
    
    // Helper function to get random booking ID from existing bookings
    const getRandomBookingId = (index: number) => {
        return bookingIds[index % bookingIds.length];
    };

    // Generate dates over past 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

    const sampleTransactions = [
        {
            bookingId: getRandomBookingId(0),
            userId: 1,
            amount: 45000,
            currency: 'USD',
            status: 'completed',
            paymentMethod: 'credit_card',
            transactionId: 'txn_7k9m2n4p5q6r',
            createdAt: new Date(sixMonthsAgo.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: getRandomBookingId(1),
            userId: 2,
            amount: 125000,
            currency: 'USD',
            status: 'completed',
            paymentMethod: 'stripe',
            transactionId: 'txn_8x3c4v5b6n7m',
            createdAt: new Date(sixMonthsAgo.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: getRandomBookingId(2),
            userId: 3,
            amount: 67500,
            currency: 'USD',
            status: 'pending',
            paymentMethod: 'debit_card',
            transactionId: 'txn_9w2e3r4t5y6u',
            createdAt: new Date(sixMonthsAgo.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: getRandomBookingId(3),
            userId: 4,
            amount: 89000,
            currency: 'USD',
            status: 'completed',
            paymentMethod: 'paypal',
            transactionId: 'txn_1a2s3d4f5g6h',
            createdAt: new Date(sixMonthsAgo.getTime() + Math.random() * 120 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: getRandomBookingId(4),
            userId: 5,
            amount: 156000,
            currency: 'USD',
            status: 'completed',
            paymentMethod: 'credit_card',
            transactionId: 'txn_2z3x4c5v6b7n',
            createdAt: new Date(sixMonthsAgo.getTime() + Math.random() * 150 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: getRandomBookingId(5),
            userId: 6,
            amount: 34500,
            currency: 'USD',
            status: 'failed',
            paymentMethod: 'debit_card',
            transactionId: 'txn_3q4w5e6r7t8y',
            createdAt: new Date(sixMonthsAgo.getTime() + Math.random() * 40 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: getRandomBookingId(6),
            userId: 7,
            amount: 198000,
            currency: 'USD',
            status: 'completed',
            paymentMethod: 'stripe',
            transactionId: 'txn_4u5i6o7p8a9s',
            createdAt: new Date(sixMonthsAgo.getTime() + Math.random() * 70 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: getRandomBookingId(7),
            userId: 8,
            amount: 52000,
            currency: 'USD',
            status: 'pending',
            paymentMethod: 'credit_card',
            transactionId: 'txn_5d6f7g8h9j0k',
            createdAt: new Date(sixMonthsAgo.getTime() + Math.random() * 100 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: getRandomBookingId(8),
            userId: 9,
            amount: 73500,
            currency: 'USD',
            status: 'completed',
            paymentMethod: 'paypal',
            transactionId: 'txn_6l7z8x9c0v1b',
            createdAt: new Date(sixMonthsAgo.getTime() + Math.random() * 130 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: getRandomBookingId(9),
            userId: 10,
            amount: 112000,
            currency: 'USD',
            status: 'refunded',
            paymentMethod: 'credit_card',
            transactionId: 'txn_7n8m9k0j1h2g',
            createdAt: new Date(sixMonthsAgo.getTime() + Math.random() * 160 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: getRandomBookingId(10),
            userId: 11,
            amount: 94500,
            currency: 'USD',
            status: 'completed',
            paymentMethod: 'stripe',
            transactionId: 'txn_8f9d0s1a2w3e',
            createdAt: new Date(sixMonthsAgo.getTime() + Math.random() * 50 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: getRandomBookingId(11),
            userId: 12,
            amount: 167000,
            currency: 'USD',
            status: 'pending',
            paymentMethod: 'debit_card',
            transactionId: 'txn_9q0w1e2r3t4y',
            createdAt: new Date(sixMonthsAgo.getTime() + Math.random() * 80 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: getRandomBookingId(12),
            userId: 13,
            amount: 48000,
            currency: 'USD',
            status: 'completed',
            paymentMethod: 'paypal',
            transactionId: 'txn_0u1i2o3p4l5k',
            createdAt: new Date(sixMonthsAgo.getTime() + Math.random() * 110 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: getRandomBookingId(13),
            userId: 14,
            amount: 135000,
            currency: 'USD',
            status: 'completed',
            paymentMethod: 'credit_card',
            transactionId: 'txn_1j2h3g4f5d6s',
            createdAt: new Date(sixMonthsAgo.getTime() + Math.random() * 140 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            bookingId: getRandomBookingId(14),
            userId: 15,
            amount: 82500,
            currency: 'USD',
            status: 'pending',
            paymentMethod: 'stripe',
            transactionId: 'txn_2a3z4x5c6v7b',
            createdAt: new Date(sixMonthsAgo.getTime() + Math.random() * 170 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ];

    await db.insert(transactions).values(sampleTransactions);
    
    console.log('✅ Transactions seeder completed successfully');
    console.log(`📊 Seeded ${sampleTransactions.length} transactions`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});