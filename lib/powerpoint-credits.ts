/**
 * PowerPoint Credit Calculation
 * - 5 slides or less: 20 credits
 * - Above 5 slides: 20 credits + 7 credits per additional slide
 */

export function calculatePowerPointCredits(slideCount: number): number {
  if (slideCount <= 5) {
    return 20;
  }
  
  // 20 credits base + 7 credits per slide above 5
  const additionalSlides = slideCount - 5;
  return 20 + (additionalSlides * 7);
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
  
  const additionalSlides = slideCount - 5;
  const additionalCredits = additionalSlides * 7;
  const totalCredits = 20 + additionalCredits;
  
  return {
    baseCredits: 20,
    additionalCredits,
    totalCredits,
    breakdown: `${slideCount} slides = 20 credits (base) + ${additionalCredits} credits (${additionalSlides} extra slides × 7) = ${totalCredits} credits`,
  };
}

