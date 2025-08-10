function getImageUrl(src: string | undefined) {
  if (!src || typeof src !== 'string') return src;
  const image = src.split('ipfs://');
  if (image.length === 2) {
    return `https://gateway.lighthouse.storage/ipfs/${image[1]}`;
  }
  return src;
}

export function GraphImage(
  props: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
) {
  return <img {...props} src={getImageUrl(props.src)} />;
}
