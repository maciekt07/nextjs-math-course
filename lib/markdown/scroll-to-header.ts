type ScrollToHeaderOptions = {
  containerSelector?: string;
  baseOffset?: number;
  sidebarOffset?: number;
  sidebarOpen?: boolean;
  behavior?: ScrollBehavior;
};

// avoids native hash scroll issues
export function scrollToHeader(
  id: string,
  {
    containerSelector = "main",
    baseOffset = 16,
    sidebarOffset = 64,
    sidebarOpen = false,
    behavior = "instant",
  }: ScrollToHeaderOptions = {},
) {
  const el = document.getElementById(id);
  if (!el) return;

  const container = document.querySelector(
    containerSelector,
  ) as HTMLElement | null;
  if (!container) return;

  const elRect = el.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const offsetTop = elRect.top - containerRect.top + container.scrollTop;

  const margin = baseOffset + (!sidebarOpen ? sidebarOffset : 0);

  container.scrollTo({
    top: offsetTop - margin,
    behavior,
  });

  history.replaceState(null, "", `#${id}`);
}
