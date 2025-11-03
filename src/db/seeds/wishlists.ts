import { db } from '@/db';
import { wishlists } from '@/db/schema';

async function main() {
    const sampleWishlists = [
        {
            userId: 1,
            propertyId: 1,
            createdAt: new Date('2024-08-15').toISOString(),
        },
        {
            userId: 1,
            propertyId: 3,
            createdAt: new Date('2024-09-20').toISOString(),
        },
        {
            userId: 2,
            propertyId: 2,
            createdAt: new Date('2024-07-10').toISOString(),
        },
        {
            userId: 3,
            propertyId: 1,
            createdAt: new Date('2024-10-05').toISOString(),
        },
        {
            userId: 3,
            propertyId: 4,
            createdAt: new Date('2024-11-12').toISOString(),
        },
        {
            userId: 5,
            propertyId: 5,
            createdAt: new Date('2024-08-25').toISOString(),
        },
        {
            userId: 7,
            propertyId: 2,
            createdAt: new Date('2024-09-15').toISOString(),
        },
        {
            userId: 8,
            propertyId: 6,
            createdAt: new Date('2024-10-20').toISOString(),
        },
        {
            userId: 10,
            propertyId: 3,
            createdAt: new Date('2024-11-01').toISOString(),
        },
        {
            userId: 12,
            propertyId: 1,
            createdAt: new Date('2024-07-30').toISOString(),
        },
        {
            userId: 13,
            propertyId: 5,
            createdAt: new Date('2024-08-18').toISOString(),
        },
        {
            userId: 15,
            propertyId: 4,
            createdAt: new Date('2024-09-08').toISOString(),
        },
    ];

    await db.insert(wishlists).values(sampleWishlists);
    
    console.log('✅ Wishlists seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});