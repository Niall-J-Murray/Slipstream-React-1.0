export default function Body(props: any) {
  return <div className="grid grid-cols-5 gap-4 pt-5">{props.children}</div>;
}