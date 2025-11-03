import { db } from '@/db';
import { propertyAvailability } from '@/db/schema';

async function main() {
    const today = new Date();
    const availabilityData = [];
    
    // Base prices for each property (matching the properties table)
    const propertyBasePrices = {
        1: 850,
        2: 325,
        3: 425,
        4: 295,
        5: 675,
        6: 375
    };
    
    // Helper function to check if date is weekend
    const isWeekend = (date: Date): boolean => {
        const day = date.getDay();
        return day === 5 || day === 6; // Friday or Saturday
    };
    
    // Helper function to check if date is in holiday period
    const isHolidayPeriod = (date: Date): boolean => {
        const month = date.getMonth();
        const day = date.getDate();
        
        // Christmas/New Year period (Dec 20 - Jan 5)
        if ((month === 11 && day >= 20) || (month === 0 && day <= 5)) return true;
        
        // Thanksgiving week (late November)
        if (month === 10 && day >= 20) return true;
        
        // July 4th week
        if (month === 6 && day >= 1 && day <= 7) return true;
        
        // Memorial Day weekend (late May)
        if (month === 4 && day >= 25) return true;
        
        return false;
    };
    
    // Helper function to calculate dynamic price
    const calculatePrice = (basePrice: number, date: Date): number => {
        let price = basePrice;
        
        if (isHolidayPeriod(date)) {
            price = Math.round(price * 1.3); // +30% for holidays
        } else if (isWeekend(date)) {
            price = Math.round(price * 1.2); // +20% for weekends
        }
        
        return price;
    };
    
    // Booking patterns for each property (consecutive blocked days)
    const bookingPatterns = {
        1: [
            { start: 5, duration: 5 },
            { start: 15, duration: 7 },
            { start: 35, duration: 4 },
            { start: 50, duration: 6 },
            { start: 72, duration: 5 }
        ],
        2: [
            { start: 3, duration: 4 },
            { start: 20, duration: 5 },
            { start: 40, duration: 6 },
            { start: 58, duration: 4 },
            { start: 80, duration: 3 }
        ],
        3: [
            { start: 8, duration: 6 },
            { start: 25, duration: 5 },
            { start: 45, duration: 7 },
            { start: 65, duration: 4 },
            { start: 85, duration: 3 }
        ],
        4: [
            { start: 2, duration: 3 },
            { start: 18, duration: 5 },
            { start: 38, duration: 4 },
            { start: 55, duration: 6 },
            { start: 75, duration: 5 }
        ],
        5: [
            { start: 10, duration: 7 },
            { start: 28, duration: 5 },
            { start: 48, duration: 6 },
            { start: 68, duration: 4 },
            { start: 82, duration: 3 }
        ],
        6: [
            { start: 6, duration: 4 },
            { start: 22, duration: 6 },
            { start: 42, duration: 5 },
            { start: 60, duration: 7 },
            { start: 78, duration: 4 }
        ]
    };
    
    // Helper function to check if day is booked for a property
    const isBooked = (propertyId: number, dayOffset: number): boolean => {
        const patterns = bookingPatterns[propertyId as keyof typeof bookingPatterns];
        return patterns.some(pattern => 
            dayOffset >= pattern.start && dayOffset < pattern.start + pattern.duration
        );
    };
    
    // Generate availability data for each property for next 90 days
    for (let propertyId = 1; propertyId <= 6; propertyId++) {
        for (let dayOffset = 0; dayOffset < 90; dayOffset++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + dayOffset);
            
            const dateString = currentDate.toISOString().split('T')[0];
            const basePrice = propertyBasePrices[propertyId as keyof typeof propertyBasePrices];
            const dynamicPrice = calculatePrice(basePrice, currentDate);
            const available = !isBooked(propertyId, dayOffset);
            
            availabilityData.push({
                propertyId,
                date: dateString,
                isAvailable: available,
                price: dynamicPrice
            });
        }
    }
    
    await db.insert(propertyAvailability).values(availabilityData);
    
    console.log('✅ Property availability seeder completed successfully');
    console.log(`Generated ${availabilityData.length} availability entries for 6 properties over 90 days`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});