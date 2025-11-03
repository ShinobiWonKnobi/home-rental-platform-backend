import { db } from '@/db';
import { hostProfiles } from '@/db/schema';

async function main() {
    const sampleHostProfiles = [
        {
            userId: 2,
            languages: JSON.stringify(['English', 'Spanish']),
            responseTime: 'within an hour',
            responseRate: 98,
            superhostStatus: true,
            propertyCount: 3,
            totalReviews: 142,
            averageRating: 4.9,
        },
        {
            userId: 3,
            languages: JSON.stringify(['English', 'French', 'Italian']),
            responseTime: 'within a few hours',
            responseRate: 95,
            superhostStatus: true,
            propertyCount: 2,
            totalReviews: 89,
            averageRating: 4.8,
        },
        {
            userId: 5,
            languages: JSON.stringify(['English']),
            responseTime: 'within an hour',
            responseRate: 92,
            superhostStatus: false,
            propertyCount: 1,
            totalReviews: 45,
            averageRating: 4.7,
        },
        {
            userId: 7,
            languages: JSON.stringify(['English', 'German']),
            responseTime: 'within a day',
            responseRate: 88,
            superhostStatus: false,
            propertyCount: 2,
            totalReviews: 67,
            averageRating: 4.6,
        },
        {
            userId: 9,
            languages: JSON.stringify(['English', 'Portuguese']),
            responseTime: 'within a few hours',
            responseRate: 94,
            superhostStatus: true,
            propertyCount: 4,
            totalReviews: 128,
            averageRating: 4.9,
        },
        {
            userId: 11,
            languages: JSON.stringify(['English', 'Japanese']),
            responseTime: 'within an hour',
            responseRate: 97,
            superhostStatus: false,
            propertyCount: 1,
            totalReviews: 34,
            averageRating: 4.8,
        },
        {
            userId: 13,
            languages: JSON.stringify(['English', 'Spanish', 'French']),
            responseTime: 'within a few hours',
            responseRate: 91,
            superhostStatus: false,
            propertyCount: 3,
            totalReviews: 103,
            averageRating: 4.7,
        },
        {
            userId: 15,
            languages: JSON.stringify(['English', 'Dutch']),
            responseTime: 'within a day',
            responseRate: 85,
            superhostStatus: false,
            propertyCount: 2,
            totalReviews: 56,
            averageRating: 4.5,
        },
    ];

    await db.insert(hostProfiles).values(sampleHostProfiles);
    
    console.log('✅ Host profiles seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});