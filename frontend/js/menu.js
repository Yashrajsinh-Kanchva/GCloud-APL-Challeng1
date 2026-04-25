export const shops = [
    {
        id: 'mumbai_masala',
        shopName: 'Mumbai Masala Junction',
        tagline: 'Pure Veg Street Delights',
        category: 'Street Food',
        icon: '🌶️',
        themeBg: 'group-hover:bg-red-500/10',
        themeText: 'group-hover:text-red-500',
        crowd: 'HIGH CROWD',
        items: [
            { id: 101, name: 'Mumbai Vada Pav', price: 60, icon: '🍔' },
            { id: 102, name: 'Pani Puri (6 pcs)', price: 50, icon: '🥘' },
            { id: 103, name: 'Sev Puri', price: 70, icon: '🥗' }
        ]
    },
    {
        id: 'chai_byte',
        shopName: 'Chai & Byte',
        tagline: 'Tapri-Style Chai & Snacks',
        category: 'Chai/Snacks',
        icon: '☕',
        themeBg: 'group-hover:bg-orange-500/10',
        themeText: 'group-hover:text-orange-500',
        crowd: 'MED CROWD',
        items: [
            { id: 201, name: 'Cutting Chai', price: 20, icon: '☕' },
            { id: 202, name: 'Bun Maska', price: 40, icon: '🥐' },
            { id: 203, name: 'Kanda Poha', price: 50, icon: '🍛' }
        ]
    },
    {
        id: 'annapurna',
        shopName: 'Annapurna Rasoi',
        tagline: 'Home-Style Thali & Meals',
        category: 'Full Meal',
        icon: '🍲',
        themeBg: 'group-hover:bg-amber-500/10',
        themeText: 'group-hover:text-amber-500',
        crowd: 'LOW CROWD',
        items: [
            { id: 301, name: 'Special Veg Thali', price: 250, icon: '🍱' },
            { id: 302, name: 'Dal Tadka Rice', price: 150, icon: '🍛' },
            { id: 303, name: 'Roti Sabzi Combo', price: 120, icon: '🥙' }
        ]
    },
    {
        id: 'delhi_chatakha',
        shopName: 'Delhi Chatakha',
        tagline: 'Indian Fusion Fast Food',
        category: 'Fast Food',
        icon: '🍕',
        themeBg: 'group-hover:bg-rose-500/10',
        themeText: 'group-hover:text-rose-500',
        crowd: 'HIGH CROWD',
        items: [
            { id: 401, name: 'Paneer Tikka Pizza', price: 280, icon: '🍕' },
            { id: 402, name: 'Desi Burger', price: 110, icon: '🍔' },
            { id: 403, name: 'Masala French Fries', price: 90, icon: '🍟' }
        ]
    },
    {
        id: 'green_bowl',
        shopName: 'The Green Bowl Co.',
        tagline: 'Modern Healthy Eats',
        category: 'Healthy',
        icon: '🥗',
        themeBg: 'group-hover:bg-emerald-500/10',
        themeText: 'group-hover:text-emerald-500',
        crowd: 'LOW CROWD',
        items: [
            { id: 501, name: 'Paneer Tikka Salad', price: 180, icon: '🥗' },
            { id: 502, name: 'Cold Pressed Juice', price: 120, icon: '🧃' },
            { id: 503, name: 'Sprout Chaat', price: 80, icon: '🍲' }
        ]
    },
    {
        id: 'chill_thrill',
        shopName: 'Chill & Thrill Drinks',
        tagline: 'Cool Beverages & Desserts',
        category: 'Cold Items',
        icon: '🧊',
        themeBg: 'group-hover:bg-indigo-500/10',
        themeText: 'group-hover:text-indigo-500',
        crowd: 'MED CROWD',
        items: [
            { id: 601, name: 'Kulfi Falooda', price: 140, icon: '🍦' },
            { id: 602, name: 'Thick Mango Milkshake', price: 150, icon: '🥛' },
            { id: 603, name: 'Kala Khatta Gola', price: 80, icon: '🍧' }
        ]
    }
];

// Flat array for easy cart and rendering lookups
export const menuItems = shops.flatMap(shop => 
    shop.items.map(item => ({ ...item, shopId: shop.id }))
);
