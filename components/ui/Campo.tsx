type Props = {
  id: string;
  label: string;
  erro?: string;
  ajuda?: string;
  obrigatorio?: boolean;
  children: React.ReactNode;
};

/** Rótulo + campo + ajuda + erro, sempre no mesmo formato. */
export function Campo({ id, label, erro, ajuda, obrigatorio, children }: Props) {
  return (
    <div>
      <label htmlFor={id} className="rotulo">
        {label}
        {obrigatorio && <span className="ml-0.5 text-marca-600">*</span>}
        {!obrigatorio && <span className="ml-1 font-normal text-slate-400">(opcional)</span>}
      </label>
      {children}
      {ajuda && !erro && <p className="ajuda">{ajuda}</p>}
      {erro && (
        <p className="msg-erro" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}
