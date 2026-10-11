export function MapEmbed({ query, embedUrl, title }: { query: string; embedUrl?: string; title: string }) {
  const src = embedUrl && /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/.test(embedUrl) ? embedUrl : `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
  return (
    <iframe
      title={title}
      src={src}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
      className="h-full min-h-[320px] w-full border-0"
    />
  );
}
