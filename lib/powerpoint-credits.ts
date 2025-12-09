/**
 * PowerPoint Credit Calculation
 * - 5 slides or less: 20 credits
 * - 6 slides: 27 credits (20 + 7)
 * - 7 slides: 33 credits
 * - Above 7 slides: 33 credits + 7 credits per additional slide
 */

export function calculatePowerPointCredits(slideCount: number): number {
  if (slideCount <= 5) {
    return 20;
  }
  
  if (slideCount === 6) {
    return 27;
  }
  
  if (slideCount === 7) {
    return 33;
  }
  
  // 7+ slides: 33 credits base + 7 credits per slide above 7
  const additionalSlides = slideCount - 7;
  return 33 + (additionalSlides * 7);
}

/**
 * Get credit breakdown for display
 */
export function getPowerPointCreditBreakdown(slideCount: number): {
  baseCredits: number;
  additionalCredits: number;
  totalCredits: number;
  breakdown: string;
} {
  if (slideCount <= 5) {
    return {
      baseCredits: 20,
      additionalCredits: 0,
      totalCredits: 20,
      breakdown: `${slideCount} slides = 20 credits`,
    };
  }
  
  if (slideCount === 6) {
    return {
      baseCredits: 20,
      additionalCredits: 7,
      totalCredits: 27,
      breakdown: `6 slides = 20 credits (base) + 7 credits (1 extra slide) = 27 credits`,
    };
  }
  
  if (slideCount === 7) {
    return {
      baseCredits: 20,
      additionalCredits: 13,
      totalCredits: 33,
      breakdown: `7 slides = 33 credits`,
    };
  }
  
  // 8+ slides
  const additionalSlides = slideCount - 7;
  const additionalCredits = additionalSlides * 7;
  const totalCredits = 33 + additionalCredits;
  
  return {
    baseCredits: 33,
    additionalCredits,
    totalCredits,
    breakdown: `${slideCount} slides = 33 credits (base for 7 slides) + ${additionalCredits} credits (${additionalSlides} extra slides × 7) = ${totalCredits} credits`,
  };
}

