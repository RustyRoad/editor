export function updateButtonState(
  button: HTMLElement | null,
  { text, disabled, backgroundColor }: { text?: string; disabled?: boolean; backgroundColor?: string }
): void {
  if (!button) return;
  if (text !== undefined) button.innerText = text;
  if (disabled !== undefined) (button as HTMLButtonElement).disabled = disabled;
  if (backgroundColor !== undefined) {
    button.style.backgroundColor = backgroundColor;
    button.onmouseout = () => button.style.backgroundColor = backgroundColor || '#007bff';
  }
}
