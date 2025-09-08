import Image from "next/image";
export default function Logo(props: { width: number; height: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Rashtrawadi Jansunavani logo"
      width={props.width}
      height={props.height}
      className="rounded-md"
    />
  );
}
