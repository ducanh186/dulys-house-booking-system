import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

function resolveLinkKind(to) {
  if (!to) return 'internal';
  if (to.startsWith('/') || to.startsWith('#')) return 'internal';
  return 'external';
}

function ActionLink({ to, children, variant = 'primary' }) {
  const baseClass =
    variant === 'secondary'
      ? 'inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container'
      : 'inline-flex items-center justify-center rounded-full sunlight-gradient px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90';

  if (resolveLinkKind(to) === 'external') {
    return (
      <a href={to} className={baseClass}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={baseClass}>
      {children}
    </Link>
  );
}

export default function StaticPageTemplate({
  eyebrow,
  title,
  intro,
  stats = [],
  sections = [],
  primaryCta,
  secondaryCta,
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-surface-container-low">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.22),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_34%)]" />
        <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
              <Sparkles className="h-4 w-4" />
              {eyebrow}
            </div>
            <h1 className="font-headline text-3xl sm:text-5xl font-bold text-on-surface leading-tight">
              {title}
            </h1>
            <p className="max-w-2xl text-sm sm:text-base leading-7 text-on-surface-variant">
              {intro}
            </p>
            {(primaryCta || secondaryCta) && (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {primaryCta && (
                  <ActionLink to={primaryCta.to}>
                    {primaryCta.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </ActionLink>
                )}
                {secondaryCta && (
                  <ActionLink to={secondaryCta.to} variant="secondary">
                    {secondaryCta.label}
                  </ActionLink>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16 pt-8 space-y-8">
        {stats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[28px] border border-border bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                <p className="font-headline text-2xl font-bold text-on-surface">{stat.value}</p>
                <p className="mt-1 text-sm text-on-surface-variant">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[28px] border border-border bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)]"
            >
              <h2 className="font-headline text-xl font-bold text-on-surface">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-on-surface-variant">
                {(section.paragraphs || []).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.points?.length > 0 && (
                <ul className="mt-5 space-y-2">
                  {section.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-on-surface">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="rounded-[32px] border border-primary/15 bg-primary/5 px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h3 className="font-headline text-xl font-bold text-on-surface">Duly's House</h3>
              <p className="text-sm text-on-surface-variant">
                Các trang này là nội dung khung để footer và hệ thống route có thể hoạt động đồng bộ ngay.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {primaryCta && (
                <ActionLink to={primaryCta.to}>
                  {primaryCta.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </ActionLink>
              )}
              {secondaryCta && (
                <ActionLink to={secondaryCta.to} variant="secondary">
                  {secondaryCta.label}
                </ActionLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
