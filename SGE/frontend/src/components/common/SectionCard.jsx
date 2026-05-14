import React from 'react';
export default function SectionCard({ title, subtitle, children, right }) {
  return (
    <section className="section-card">
      <div className="section-header">
        <div>
          <h3 className="section-title">{title}</h3>
          {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      <div>{children}</div>
    </section>
  );
}
