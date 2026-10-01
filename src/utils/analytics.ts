type Context = { calculator: 'dog_age' | 'cat_age'; language: 'zh-TW' | 'en' };
export type Destination = 'aging_signs' | 'aging_by_size' | 'aging_by_weight' | 'senior_care' | 'pet_aging_guide' | 'senior_health_guide' | 'dog_human_years' | 'cat_lifespan_context' | 'lifespan_tool';
export type ValidationError = 'blank' | 'negative' | 'invalid' | 'out_of_range';
type Events = {
  calculator_result_generated: Context & { interaction: 'submit' };
  calculator_validation_error: Context & { error_type: ValidationError };
  related_article_clicked: Context & { destination: Destination };
};

export function trackEvent<E extends keyof Events>(eventName: E, params: Events[E]): void {
  try {
    if (typeof window === 'undefined') return;
    const analyticsWindow = window as Window & { gtag?: (command: 'event', name: E, parameters: Events[E]) => void };
    if (typeof analyticsWindow.gtag === 'function') analyticsWindow.gtag('event', eventName, params);
  } catch {
    // Analytics must never interrupt calculation, validation or navigation.
  }
}

export function bindRelatedLinks(root: HTMLElement, context: Context): void {
  root.querySelectorAll<HTMLAnchorElement>('a[data-destination]').forEach(link => {
    link.addEventListener('click', () => trackEvent('related_article_clicked', {
      ...context, destination: link.dataset.destination as Destination,
    }));
  });
}

export function classifyValidationError(input: HTMLInputElement): ValidationError {
  if (input.validity.badInput) return 'invalid';
  if (input.value.trim() === '') return 'blank';
  if (!Number.isFinite(input.valueAsNumber)) return 'invalid';
  if (input.valueAsNumber < 0) return 'negative';
  return 'out_of_range';
}
