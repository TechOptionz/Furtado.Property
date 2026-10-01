import type { ConstructionStage } from "@/lib/projects";
import ui from "./ui.module.css";
import styles from "./MiraLiving.module.css";

// Mira Living's build as one horizontal track: completed stages filled, the current one filled as far as its
// percentage, later ones outlined. An ordered list underneath, so each stage reads as text.
const STATUS = { complete: "Complete", current: "In progress", upcoming: "To come" };

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(iso),
  );

export default function ConstructionProgress({
  stages,
  lastUpdated,
}: {
  stages: ConstructionStage[];
  lastUpdated: string | null;
}) {
  return (
    <div className={styles.progress}>
      <div data-reveal="text" className={ui.rule}>
        <h3 className={ui.label}>Construction progress</h3>
        <p className={styles.updated}>
          Last updated: {lastUpdated ? <time dateTime={lastUpdated}>{formatDate(lastUpdated)}</time> : "to be confirmed"}
        </p>
      </div>
      <ol className={styles.track}>
        {stages.map((stage, i) => {
          const fill = stage.status === "complete" ? 100 : stage.status === "current" ? (stage.percent ?? 0) : 0;
          return (
            <li
              key={stage.name}
              data-reveal="text"
              data-delay={i * 80}
              data-status={stage.status}
              aria-current={stage.status === "current" ? "step" : undefined}
            >
              <span className={styles.rail} aria-hidden>
                {fill > 0 && <span data-reveal="rule" data-delay={200 + i * 160} style={{ width: `${fill}%` }} />}
              </span>
              <span className={styles.stageName}>
                {stage.name}
                {stage.status === "current" && <b>{fill}%</b>}
              </span>
              <span className={styles.stageNote}>
                <span className={ui.srOnly}>{STATUS[stage.status]}: </span>
                {stage.note}
                {stage.status === "current" && <span className={ui.srOnly}>, {fill}% complete</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
