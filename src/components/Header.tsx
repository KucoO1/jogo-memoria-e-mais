interface HeaderProps {
  onRestart: () => void;
  onChangeDifficulty: (size: number) => void;
  onChangeTheme: (theme: "animals" | "food" | "transport") => void;
}

export default function Header({ onRestart, onChangeDifficulty, onChangeTheme }: HeaderProps) {
  return (
    <header className="flex gap-4 p-4 bg-white shadow">
      <button onClick={onRestart} className="px-4 py-2 bg-blue-500 text-white rounded">
        Reiniciar
      </button>

      <select onChange={(e) => onChangeDifficulty(Number(e.target.value))}>
        <option value={4}>4x4</option>
        <option value={6}>6x6</option>
      </select>

      <select onChange={(e) => onChangeTheme(e.target.value as "animals" | "food" | "transport")}>
        <option value="animals">Animais</option>
        <option value="food">Comida</option>
        <option value="transport">Transporte</option>
      </select>
    </header>
  );
}
