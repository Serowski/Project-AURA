/**
 * Viking-styled warning banner shown at the top of the main area
 * whenever an alarm is fired.
 */
export default function AlertTicker({ alert }) {
  if (!alert) return null;
  return (
    <div className="alert-ticker" role="alert">
      <span className="alert-ticker__rune" aria-hidden>ᚺ</span>
      <span className="alert-ticker__text">{alert.text}</span>
      <span className="alert-ticker__tag">ODIN'S WATCH</span>
    </div>
  );
}
