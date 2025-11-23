import { LootItem, Rarity } from './types';

export const CARD_WIDTH = 180; // px
export const CARD_GAP = 16; // px
export const VISIBLE_CARDS = 5; 
export const SPIN_DURATION = 5200; // Slightly faster (was 5800) for a smoother, less draggy finish
export const TOTAL_CARDS_IN_STRIP = 60; 
export const WINNING_INDEX = 35; 

// Database with Real Transparent PNGs
export const ITEMS_DB: LootItem[] = [
  // --- BASURA (COMMON) ---
  { 
    id: 'c1', 
    name: 'Mazapán De La Rosa', 
    rarity: Rarity.COMMON, 
    price: 10, 
    odds: 35.5,
    image: 'https://i.imgur.com/Fh76q9j.png' 
  },
  { 
    id: 'c2', 
    name: 'Sopa Maruchan', 
    rarity: Rarity.COMMON, 
    price: 15, 
    odds: 30.0,
    image: 'https://pngimg.com/d/noodle_PNG47.png' 
  },
  { 
    id: 'c3', 
    name: 'Boleto del Metro', 
    rarity: Rarity.COMMON, 
    price: 5, 
    odds: 15.0,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Metro_de_la_Ciudad_de_M%C3%A9xico_Logotipo.svg/1200px-Metro_de_la_Ciudad_de_M%C3%A9xico_Logotipo.svg.png' 
  },
  { 
    id: 'c4', 
    name: 'Chicle Motita', 
    rarity: Rarity.COMMON, 
    price: 2, 
    odds: 10.0,
    image: 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/2/28/latest/20191222221208/Caramelo_raro_EP.png/150px-Caramelo_raro_EP.png' 
  },

  // --- MEDIO (RARE) ---
  { 
    id: 'r1', 
    name: 'Funko Spider-Man', 
    rarity: Rarity.RARE, 
    price: 350, 
    odds: 5.0,
    image: 'https://purepng.com/public/uploads/large/purepng.com-spider-man-funko-pop-toytoyobjectchildrentoy-comic-spider-man-funko-pop-6315202962747f2y0.png' 
  },
  { 
    id: 'r2', 
    name: 'Recarga Telcel $100', 
    rarity: Rarity.RARE, 
    price: 100, 
    odds: 3.5,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Telcel_logo.svg/2560px-Telcel_logo.svg.png' 
  },
  
  // --- ALTO (EPIC) ---
  { 
    id: 'e1', 
    name: 'Nike Dunk Panda', 
    rarity: Rarity.EPIC, 
    price: 3500, 
    odds: 0.8,
    image: 'https://image.goat.com/transform/v1/attachments/product_template_pictures/images/050/203/863/original/DD1391_100.png' 
  },
  { 
    id: 'e2', 
    name: 'AirPods Pro', 
    rarity: Rarity.EPIC, 
    price: 4500, 
    odds: 0.15,
    image: 'https://www.pngmart.com/files/13/Apple-Airpods-Pro-PNG-Transparent-Image.png' 
  },

  // --- DIOS (LEGENDARY) ---
  { 
    id: 'l1', 
    name: 'iPhone 15 Pro Max', 
    rarity: Rarity.LEGENDARY, 
    price: 28000, 
    odds: 0.04,
    image: 'https://pngimg.com/d/iphone_14_PNG2.png' 
  },
  { 
    id: 'l2', 
    name: 'Italika WS150', 
    rarity: Rarity.LEGENDARY, 
    price: 19000, 
    odds: 0.01,
    image: 'https://italika.mx/Web_Italika_2016/Modelos/Trabajo/FT150/img/FT150_NEGRO.png' 
  },
];

// Updated to match new "Ghost" aesthetic colors
export const RARITY_COLORS = {
  [Rarity.COMMON]: 'text-slate-400',
  [Rarity.RARE]: 'text-cyan-400',
  [Rarity.EPIC]: 'text-purple-500',
  [Rarity.LEGENDARY]: 'text-yellow-400',
};

export const RARITY_BG_GLOW = {
  [Rarity.COMMON]: 'bg-slate-500',
  [Rarity.RARE]: 'bg-cyan-500',
  [Rarity.EPIC]: 'bg-purple-600',
  [Rarity.LEGENDARY]: 'bg-yellow-500',
};