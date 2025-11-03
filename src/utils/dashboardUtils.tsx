export default function CompactLegend({ payload, isCompact }: any) {
  if (!payload || !Array.isArray(payload)) return null;
  const fontSize = isCompact ? 11 : 13;

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {payload.map((entry: any) => (
          <div
            key={entry.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#374151',
              fontSize,
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                background: entry.color,
                display: 'inline-block',
                borderRadius: 2,
              }}
            />
            <span style={{ whiteSpace: 'nowrap' }}>{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
