import { db } from '@/db';
import { properties } from '@/db/schema';

async function main() {
    const sampleProperties = [
        {
            title: 'Luxury Beachfront Villa',
            description: 'Experience oceanfront luxury in this stunning beachfront villa with panoramic views, private pool, and direct beach access. Perfect for families and groups seeking the ultimate coastal retreat.',
            location: 'Malibu, California',
            price: 850,
            images: [
                'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
                'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80'
            ],
            bedrooms: 4,
            bathrooms: 3,
            guests: 8,
            amenities: ['WiFi', 'Pool', 'Beach Access', 'Kitchen', 'Parking', 'Air Conditioning', 'Hot Tub'],
            rating: 4.9,
            reviews: 127,
            hostName: 'Sarah Johnson',
            hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
            createdAt: new Date().toISOString(),
        },
        {
            title: 'Modern Downtown Loft',
            description: 'Stylish loft apartment in the heart of downtown with floor-to-ceiling windows, contemporary design, and walking distance to everything. Ideal for urban explorers.',
            location: 'New York, New York',
            price: 325,
            images: [
                'https://images.unsplash.com/photo-1502672260066-6bc0554d4c0a?w=1200&q=80',
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
                'https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=1200&q=80'
            ],
            bedrooms: 2,
            bathrooms: 2,
            guests: 4,
            amenities: ['WiFi', 'Kitchen', 'Workspace', 'Gym', 'Elevator', 'Washer/Dryer'],
            rating: 4.8,
            reviews: 89,
            hostName: 'Michael Chen',
            hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
            createdAt: new Date().toISOString(),
        },
        {
            title: 'Cozy Mountain Cabin',
            description: 'Escape to this charming mountain cabin surrounded by nature, featuring a stone fireplace, rustic charm, and stunning mountain views. Perfect for winter getaways and summer hikes.',
            location: 'Aspen, Colorado',
            price: 425,
            images: [
                'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200&q=80',
                'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80',
                'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200&q=80',
                'https://images.unsplash.com/photo-1518602164578-cd0074062767?w=1200&q=80'
            ],
            bedrooms: 3,
            bathrooms: 2,
            guests: 6,
            amenities: ['WiFi', 'Fireplace', 'Hiking', 'Mountain View', 'Parking', 'Heating', 'BBQ Grill'],
            rating: 4.95,
            reviews: 156,
            hostName: 'Emily Rodriguez',
            hostAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
            createdAt: new Date().toISOString(),
        },
        {
            title: 'Historic Townhouse',
            description: 'Stay in a beautifully restored historic townhouse with original architectural details, modern amenities, and a charming garden. Walk to museums, restaurants, and attractions.',
            location: 'Boston, Massachusetts',
            price: 295,
            images: [
                'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
                'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
                'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&q=80'
            ],
            bedrooms: 3,
            bathrooms: 2,
            guests: 5,
            amenities: ['WiFi', 'Kitchen', 'Historic', 'Parking', 'Garden', 'Washer/Dryer'],
            rating: 4.7,
            reviews: 94,
            hostName: 'David Thompson',
            hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
            createdAt: new Date().toISOString(),
        },
        {
            title: 'Tropical Paradise Retreat',
            description: 'Immerse yourself in tropical luxury at this island retreat with lush gardens, outdoor living spaces, and steps from pristine beaches. Your private paradise awaits.',
            location: 'Maui, Hawaii',
            price: 675,
            images: [
                'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80',
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
                'https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?w=1200&q=80',
                'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1200&q=80'
            ],
            bedrooms: 3,
            bathrooms: 3,
            guests: 6,
            amenities: ['WiFi', 'Pool', 'Beach Access', 'Kitchen', 'Parking', 'Air Conditioning', 'Garden', 'Outdoor Shower'],
            rating: 4.92,
            reviews: 143,
            hostName: 'Alana Patel',
            hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
            createdAt: new Date().toISOString(),
        },
        {
            title: 'Lakeside Cottage',
            description: 'Unwind at this peaceful lakeside cottage with private dock, canoe access, and stunning water views. Perfect for fishing, swimming, and relaxing by the fire pit.',
            location: 'Lake Tahoe, Nevada',
            price: 375,
            images: [
                'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=1200&q=80',
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
                'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200&q=80',
                'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&q=80'
            ],
            bedrooms: 2,
            bathrooms: 1,
            guests: 4,
            amenities: ['WiFi', 'Lake Access', 'Dock', 'Canoe', 'Fire Pit', 'Kitchen', 'Parking', 'Heating'],
            rating: 4.85,
            reviews: 78,
            hostName: 'James Wilson',
            hostAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80',
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(properties).values(sampleProperties);
    
    console.log('✅ Properties seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});