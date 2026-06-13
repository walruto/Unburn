export default function Toggle({ id, defaultChecked = true, labelClassName = 'toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer' }) {
  return (
    <div className="relative inline-block w-12 align-middle select-none">
      <input
        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer opacity-0 z-10"
        type="checkbox"
        id={id}
        defaultChecked={defaultChecked}
      />
      <label className={labelClassName} htmlFor={id} />
    </div>
  );
}
