import Image from 'next/image';

export function Figure({
  src,
  alt,
  caption,
  width = 1200,
  height = 675,
}: {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}) {
  return (
    <figure className="my-10">
      <Image src={src} alt={alt} width={width} height={height} className="rounded-lg w-full h-auto" />
      {caption ? (
        <figcaption className="mt-3 text-sm text-center text-[var(--color-neutral-500)] font-sans">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
