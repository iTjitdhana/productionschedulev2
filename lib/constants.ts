/**
 * Constants for Production Schedule System
 */

// Color Palette for tasks (assigned by order, not by task type)
export const COLOR_PALETTE = [
  'bg-orange-200',   // 1
  'bg-lime-200',     // 2
  'bg-yellow-200',   // 3
  'bg-cyan-200',     // 4
  'bg-purple-200',   // 5
  'bg-emerald-200',  // 6
  'bg-sky-200',      // 7
  'bg-amber-200',    // 8
  'bg-teal-200',     // 9
  'bg-pink-200',     // 10
  'bg-violet-200',   // 11
  'bg-blue-200',     // 12
];

// Avatar Mapping: id_code -> avatar path
export const AVATAR_MAP: Record<string, string> = {
  // Exact matches
  'ae': '/images/a.jpg',
  'arm': '/images/arm.jpg',
  'saam': '/images/sam.jpg',
  'sam': '/images/sam.jpg',
  'noi': '/images/ya-noi.jpg',
  'pha': '/images/pa.jpg',
  'man': '/images/man.jpg',
  'Ola': '/images/ole.jpg',
  'ole': '/images/ole.jpg',
  'Ole': '/images/ole.jpg',
  'toon': '/images/tun.jpg',
  'tun': '/images/tun.jpg',
  'JJ': '/images/jaran.jpeg',
  'jj': '/images/jaran.jpeg',
  'Jak': '/images/jack.jpg',
  'jak': '/images/jack.jpg',
  'Jack': '/images/jack.jpg',
  'jack': '/images/jack.jpg',
  'jaran': '/images/jaran.jpeg',
  'sorn': '/placeholder-user.jpg',  // No image available
  'rd': '/placeholder-user.jpg',
  'turk': '/placeholder-user.jpg',
  'sanya': '/placeholder-user.jpg',
  'win': '/placeholder-user.jpg',
};

/**
 * Get avatar path by id_code
 * - Case-insensitive matching
 * - Returns placeholder if not found
 */
export function getAvatar(id_code: string): string {
  if (!id_code) return '/placeholder-user.jpg';
  
  // Try exact match first
  if (AVATAR_MAP[id_code]) {
    return AVATAR_MAP[id_code];
  }
  
  // Try case-insensitive match
  const lowerCode = id_code.toLowerCase();
  const foundKey = Object.keys(AVATAR_MAP).find(key => key.toLowerCase() === lowerCode);
  
  if (foundKey) {
    return AVATAR_MAP[foundKey];
  }
  
  // Return placeholder
  return '/placeholder-user.jpg';
}

// Product Image Keywords Mapping
export const PRODUCT_IMAGE_KEYWORDS: Record<string, string> = {
  'แป้ง': '/measuring-and-mixing-ingredients.jpg',
  'ไก่': '/fresh-ingredients-and-meat.jpg',
  'หมู': '/crispy-pork-belly-golden-brown.jpg',
  'ผัก': '/fresh-vegetables-in-kitchen.jpg',
  'มะนาว': '/fresh-lime-juice-in-bottles.jpg',
  'น้ำจิ้ม': '/peanut-satay-sauce-in-bowl.jpg',
  'ซอส': '/fried-rice-sauce-in-bottles.jpg',
  'เนื้อปู': '/fresh-ingredients-and-meat.jpg',
  'ปลา': '/fried-catfish-crispy-golden.jpg',
  'ของแห้ง': '/dry-goods-and-packaged-ingredients.jpg',
  'แห้ง': '/dry-goods-and-packaged-ingredients.jpg',
  'ของสด': '/fresh-ingredients-and-meat.jpg',
  'สด': '/fresh-ingredients-and-meat.jpg',
  'แกง': '/orange-curry-sauce-in-pot.jpg',
  'ตวง': '/measuring-and-mixing-ingredients.jpg',
};

// ==================== Phase 2: Step Colors ====================

/**
 * Get step gradient colors based on base color
 * Phase 2: Generate gradient colors for process steps
 */
export const STEP_GRADIENT_MAP: Record<string, string[]> = {
  'bg-orange-200': ['bg-orange-100', 'bg-orange-200', 'bg-orange-300', 'bg-orange-400', 'bg-orange-500'],
  'bg-lime-200': ['bg-lime-100', 'bg-lime-200', 'bg-lime-300', 'bg-lime-400', 'bg-lime-500'],
  'bg-yellow-200': ['bg-yellow-100', 'bg-yellow-200', 'bg-yellow-300', 'bg-yellow-400', 'bg-yellow-500'],
  'bg-cyan-200': ['bg-cyan-100', 'bg-cyan-200', 'bg-cyan-300', 'bg-cyan-400', 'bg-cyan-500'],
  'bg-purple-200': ['bg-purple-100', 'bg-purple-200', 'bg-purple-300', 'bg-purple-400', 'bg-purple-500'],
  'bg-emerald-200': ['bg-emerald-100', 'bg-emerald-200', 'bg-emerald-300', 'bg-emerald-400', 'bg-emerald-500'],
  'bg-sky-200': ['bg-sky-100', 'bg-sky-200', 'bg-sky-300', 'bg-sky-400', 'bg-sky-500'],
  'bg-amber-200': ['bg-amber-100', 'bg-amber-200', 'bg-amber-300', 'bg-amber-400', 'bg-amber-500'],
  'bg-teal-200': ['bg-teal-100', 'bg-teal-200', 'bg-teal-300', 'bg-teal-400', 'bg-teal-500'],
  'bg-pink-200': ['bg-pink-100', 'bg-pink-200', 'bg-pink-300', 'bg-pink-400', 'bg-pink-500'],
  'bg-violet-200': ['bg-violet-100', 'bg-violet-200', 'bg-violet-300', 'bg-violet-400', 'bg-violet-500'],
  'bg-blue-200': ['bg-blue-100', 'bg-blue-200', 'bg-blue-300', 'bg-blue-400', 'bg-blue-500'],
};

/**
 * Get gradient colors for steps
 * Returns array of colors for each step
 */
export function getStepGradientColors(baseColor: string, stepCount: number): string[] {
  const colors = STEP_GRADIENT_MAP[baseColor] || STEP_GRADIENT_MAP['bg-orange-200'];
  
  // ถ้ามีขั้นตอนมากกว่าสีที่มี ให้ใช้สีซ้ำ
  if (stepCount <= colors.length) {
    return colors.slice(0, stepCount);
  }
  
  // ถ้ามีขั้นตอนมากกว่า ให้วนสี
  const result: string[] = [];
  for (let i = 0; i < stepCount; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
}

// ==================== Product Images ====================

/**
 * Get product image by job_name
 * - Partial matching (contains keyword)
 * - Returns placeholder if not found
 */
export function getProductImage(job_name: string): string {
  if (!job_name) return '/placeholder.jpg';
  
  // Try to find keyword in job_name
  for (const [keyword, image] of Object.entries(PRODUCT_IMAGE_KEYWORDS)) {
    if (job_name.includes(keyword)) {
      return image;
    }
  }
  
  // Return placeholder
  return '/placeholder.jpg';
}

// Time Grid Configuration
export const START_TIME = 8 * 60;        // 8:00 AM = 480 minutes
export const END_TIME = 17 * 60;         // 5:00 PM = 1020 minutes
export const MINUTES_PER_GRID = 5;       // 5 minutes per grid unit
export const TOTAL_GRID_COLUMNS = (END_TIME - START_TIME) / MINUTES_PER_GRID; // 108 columns

/**
 * Convert time string (HH:MM) to minutes from midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert time to grid column index
 */
export function timeToGridColumn(time: string): number {
  const minutes = timeToMinutes(time);
  const minutesFromStart = minutes - START_TIME;
  return Math.floor(minutesFromStart / MINUTES_PER_GRID) + 1;
}

/**
 * Get grid column span for a time range
 */
export function getGridColumnSpan(startTime: string, endTime: string): { start: number; end: number } {
  const startColumn = timeToGridColumn(startTime);
  const endMinutes = timeToMinutes(endTime);
  const endMinutesFromStart = endMinutes - START_TIME;
  const endColumn = Math.ceil(endMinutesFromStart / MINUTES_PER_GRID) + 1;

  return { start: startColumn, end: endColumn };
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} ชั่วโมง`;
    }
    return `${hours} ชั่วโมง ${remainingMinutes} นาที`;
  }
  return `${minutes} นาที`;
}

/**
 * Get today's date in YYYY-MM-DD format (Asia/Bangkok timezone)
 * This prevents the date from shifting back one day
 */
export function getTodayDate(): string {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Bangkok'
  });
}

/**
 * Format date for display (Thai format)
 */
export function formatDateThai(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Bangkok'
  });
}





