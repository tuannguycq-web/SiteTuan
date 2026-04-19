import { useState } from "react";

interface SolutionStep {
  label: string;
  content: string;
  highlight?: boolean;
  isFormula?: boolean;
  isResult?: boolean;
  isError?: boolean;
  isWarning?: boolean;
}

interface Solution {
  steps: SolutionStep[];
  result: "two_roots" | "one_root" | "no_root" | "linear" | "identity" | "no_solution";
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(6)).toString();
}

function formatFraction(numerator: number, denominator: number): string {
  if (denominator === 0) return "∞";
  const result = numerator / denominator;
  if (Number.isInteger(result)) return result.toString();

  // Try to simplify fraction
  const gcd = (a: number, b: number): number => {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    return b === 0 ? a : gcd(b, a % b);
  };

  const numRounded = Math.round(numerator * 1e9);
  const denRounded = Math.round(denominator * 1e9);
  const g = gcd(Math.abs(numRounded), Math.abs(denRounded));
  const simplifiedNum = numRounded / g;
  const simplifiedDen = denRounded / g;

  if (simplifiedDen === 1) return simplifiedNum.toString();
  if (simplifiedDen === -1) return (-simplifiedNum).toString();

  const finalNum = simplifiedDen < 0 ? -simplifiedNum : simplifiedNum;
  const finalDen = Math.abs(simplifiedDen);

  return `${finalNum}/${finalDen}`;
}

function solve(a: number, b: number, c: number): Solution {
  const steps: SolutionStep[] = [];

  // Bước 1: Xác định phương trình
  steps.push({
    label: "📋 Phương trình đã cho",
    content: `${formatCoeff(a, "x²", true)} ${formatCoeff(b, "x")} ${formatConst(c)} = 0`,
    isFormula: true,
  });

  // Trường hợp a = 0
  if (a === 0) {
    steps.push({
      label: "⚠️ Kiểm tra hệ số",
      content: `Hệ số a = 0 → Đây KHÔNG phải phương trình bậc hai!`,
      isWarning: true,
    });

    if (b === 0) {
      if (c === 0) {
        steps.push({
          label: "📌 Phân tích",
          content: `a = 0, b = 0, c = 0 → Phương trình trở thành: 0 = 0`,
        });
        steps.push({
          label: "✅ Kết luận",
          content: `Phương trình nghiệm đúng với mọi x ∈ ℝ (phương trình vô số nghiệm).`,
          isResult: true,
        });
        return { steps, result: "identity" };
      } else {
        steps.push({
          label: "📌 Phân tích",
          content: `a = 0, b = 0, c = ${c} → Phương trình trở thành: ${c} = 0`,
        });
        steps.push({
          label: "❌ Kết luận",
          content: `Phương trình vô nghiệm (mâu thuẫn: ${c} ≠ 0).`,
          isError: true,
        });
        return { steps, result: "no_solution" };
      }
    } else {
      // Phương trình bậc 1: bx + c = 0
      steps.push({
        label: "📌 Phương trình bậc nhất",
        content: `a = 0 → Phương trình trở thành: ${formatCoeff(b, "x", true)} ${formatConst(c)} = 0`,
        isFormula: true,
      });
      steps.push({
        label: "🔢 Giải phương trình bậc nhất",
        content: `${formatCoeff(b, "x", true)} = ${-c}`,
      });
      const x = -c / b;
      steps.push({
        label: "📐 Tính x",
        content: `x = ${formatFraction(-c, b)} = ${formatNumber(x)}`,
      });
      steps.push({
        label: "✅ Kết luận",
        content: `Phương trình có nghiệm duy nhất: x = ${formatNumber(x)}`,
        isResult: true,
      });
      return { steps, result: "linear" };
    }
  }

  // Đây là phương trình bậc 2 thực sự
  steps.push({
    label: "✅ Xác nhận bậc phương trình",
    content: `a = ${a} ≠ 0 → Đây là phương trình bậc hai.`,
  });

  // Bước 2: Xác định các hệ số
  steps.push({
    label: "🔢 Xác định các hệ số",
    content: `a = ${a},   b = ${b},   c = ${c}`,
    highlight: true,
  });

  // Bước 3: Tính Delta
  const delta = b * b - 4 * a * c;
  steps.push({
    label: "📐 Tính Δ (Delta)",
    content: `Δ = b² − 4ac`,
    isFormula: true,
  });
  steps.push({
    label: "🧮 Thay số vào Δ",
    content: `Δ = (${b})² − 4 × (${a}) × (${c})`,
  });
  steps.push({
    label: "🧮 Tính toán Δ",
    content: `Δ = ${b * b} − (${4 * a * c}) = ${formatNumber(delta)}`,
  });

  // Bước 4: Xét dấu Delta và tìm nghiệm
  if (delta < 0) {
    steps.push({
      label: "🔍 Xét dấu Δ",
      content: `Δ = ${formatNumber(delta)} < 0`,
      isError: true,
    });
    steps.push({
      label: "❌ Kết luận",
      content: `Vì Δ < 0, phương trình VÔ NGHIỆM trong tập số thực ℝ.`,
      isError: true,
    });
    return { steps, result: "no_root" };
  } else if (delta === 0) {
    steps.push({
      label: "🔍 Xét dấu Δ",
      content: `Δ = 0`,
      highlight: true,
    });
    steps.push({
      label: "📌 Nhận xét",
      content: `Vì Δ = 0, phương trình có nghiệm kép.`,
    });

    // Nghiệm kép
    steps.push({
      label: "📐 Công thức nghiệm kép",
      content: `x₁ = x₂ = −b / (2a)`,
      isFormula: true,
    });
    steps.push({
      label: "🧮 Thay số",
      content: `x₁ = x₂ = −(${b}) / (2 × ${a}) = ${-b} / ${2 * a}`,
    });
    const x0 = -b / (2 * a);
    steps.push({
      label: "✅ Kết quả nghiệm kép",
      content: `x₁ = x₂ = ${formatFraction(-b, 2 * a)} = ${formatNumber(x0)}`,
      isResult: true,
    });

    // Kiểm tra lại
    steps.push({
      label: "🔎 Kiểm tra nghiệm (thế lại phương trình)",
      content: `Thế x = ${formatNumber(x0)} vào ${formatCoeff(a, "x²", true)} ${formatCoeff(b, "x")} ${formatConst(c)}:`,
    });
    const check = a * x0 * x0 + b * x0 + c;
    steps.push({
      label: "🧮 Tính kiểm tra",
      content: `= ${a} × (${formatNumber(x0)})² + ${b} × ${formatNumber(x0)} + ${c} = ${formatNumber(check)} ✓`,
    });

    return { steps, result: "one_root" };
  } else {
    // Delta > 0
    steps.push({
      label: "🔍 Xét dấu Δ",
      content: `Δ = ${formatNumber(delta)} > 0`,
      highlight: true,
    });
    steps.push({
      label: "📌 Nhận xét",
      content: `Vì Δ > 0, phương trình có hai nghiệm phân biệt.`,
    });

    // Tính căn Delta
    const sqrtDelta = Math.sqrt(delta);
    steps.push({
      label: "📐 Tính √Δ",
      content: `√Δ = √${formatNumber(delta)} = ${formatNumber(sqrtDelta)}`,
      isFormula: true,
    });

    // Công thức nghiệm
    steps.push({
      label: "📐 Công thức nghiệm",
      content: `x₁ = (−b − √Δ) / (2a)   và   x₂ = (−b + √Δ) / (2a)`,
      isFormula: true,
    });

    // Tính x1
    steps.push({
      label: "🧮 Tính x₁",
      content: `x₁ = (−(${b}) − ${formatNumber(sqrtDelta)}) / (2 × ${a})`,
    });
    steps.push({
      label: "🧮 Tính x₁ (tiếp)",
      content: `x₁ = (${-b} − ${formatNumber(sqrtDelta)}) / ${2 * a} = ${formatNumber(-b - sqrtDelta)} / ${2 * a}`,
    });
    const x1 = (-b - sqrtDelta) / (2 * a);
    steps.push({
      label: "✅ Kết quả x₁",
      content: `x₁ = ${formatNumber(x1)}`,
      isResult: true,
    });

    // Tính x2
    steps.push({
      label: "🧮 Tính x₂",
      content: `x₂ = (−(${b}) + ${formatNumber(sqrtDelta)}) / (2 × ${a})`,
    });
    steps.push({
      label: "🧮 Tính x₂ (tiếp)",
      content: `x₂ = (${-b} + ${formatNumber(sqrtDelta)}) / ${2 * a} = ${formatNumber(-b + sqrtDelta)} / ${2 * a}`,
    });
    const x2 = (-b + sqrtDelta) / (2 * a);
    steps.push({
      label: "✅ Kết quả x₂",
      content: `x₂ = ${formatNumber(x2)}`,
      isResult: true,
    });

    // Định lý Vi-ét kiểm tra
    steps.push({
      label: "🔎 Kiểm tra theo định lý Viète",
      content: `x₁ + x₂ = −b/a   và   x₁ × x₂ = c/a`,
      isFormula: true,
    });
    const sum = x1 + x2;
    const product = x1 * x2;
    const expectedSum = -b / a;
    const expectedProduct = c / a;
    steps.push({
      label: "🧮 Kiểm tra tổng",
      content: `x₁ + x₂ = ${formatNumber(x1)} + ${formatNumber(x2)} = ${formatNumber(sum)}   |   −b/a = −(${b})/${a} = ${formatNumber(expectedSum)}   ✓`,
    });
    steps.push({
      label: "🧮 Kiểm tra tích",
      content: `x₁ × x₂ = ${formatNumber(x1)} × ${formatNumber(x2)} = ${formatNumber(product)}   |   c/a = ${c}/${a} = ${formatNumber(expectedProduct)}   ✓`,
    });

    return { steps, result: "two_roots" };
  }
}

function formatCoeff(coeff: number, variable: string, isFirst: boolean = false): string {
  if (coeff === 0) return "";
  if (variable === "") return coeff > 0 ? `+${coeff}` : `${coeff}`;

  let str = "";
  if (coeff === 1) str = variable;
  else if (coeff === -1) str = `-${variable}`;
  else str = `${coeff}${variable}`;

  if (!isFirst && coeff > 0) str = `+${str}`;
  return str;
}

function formatConst(c: number): string {
  if (c === 0) return "";
  return c > 0 ? `+${c}` : `${c}`;
}

function buildEquationDisplay(a: number, b: number, c: number): string {
  let eq = "";
  if (a === 1) eq += "x²";
  else if (a === -1) eq += "-x²";
  else if (a !== 0) eq += `${a}x²`;

  if (b === 1) eq += (eq ? " + " : "") + "x";
  else if (b === -1) eq += (eq ? " - " : "-") + "x";
  else if (b > 0) eq += (eq ? " + " : "") + `${b}x`;
  else if (b < 0) eq += (eq ? " - " : "") + `${Math.abs(b)}x`;

  if (c > 0) eq += (eq ? " + " : "") + `${c}`;
  else if (c < 0) eq += (eq ? " - " : "") + `${Math.abs(c)}`;

  if (!eq) eq = "0";
  return eq + " = 0";
}

export default function App() {
  const [a, setA] = useState<string>("");
  const [b, setB] = useState<string>("");
  const [c, setC] = useState<string>("");
  const [solution, setSolution] = useState<Solution | null>(null);
  const [error, setError] = useState<string>("");
  const [animateKey, setAnimateKey] = useState<number>(0);

  const handleSolve = () => {
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    const cNum = parseFloat(c);

    if (a === "" || b === "" || c === "") {
      setError("⚠️ Vui lòng nhập đầy đủ các hệ số a, b và c!");
      setSolution(null);
      return;
    }
    if (isNaN(aNum) || isNaN(bNum) || isNaN(cNum)) {
      setError("⚠️ Các hệ số phải là số hợp lệ!");
      setSolution(null);
      return;
    }

    setError("");
    setAnimateKey((k) => k + 1);
    const result = solve(aNum, bNum, cNum);
    setSolution(result);
  };

  const handleReset = () => {
    setA("");
    setB("");
    setC("");
    setSolution(null);
    setError("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSolve();
  };

  const getResultBadge = () => {
    if (!solution) return null;
    switch (solution.result) {
      case "two_roots":
        return { text: "Hai nghiệm phân biệt", color: "from-emerald-500 to-teal-500" };
      case "one_root":
        return { text: "Nghiệm kép", color: "from-blue-500 to-indigo-500" };
      case "no_root":
        return { text: "Vô nghiệm", color: "from-red-500 to-rose-500" };
      case "linear":
        return { text: "Phương trình bậc nhất", color: "from-amber-500 to-orange-500" };
      case "identity":
        return { text: "Vô số nghiệm", color: "from-purple-500 to-violet-500" };
      case "no_solution":
        return { text: "Vô nghiệm", color: "from-red-500 to-rose-500" };
      default:
        return null;
    }
  };

  const badge = getResultBadge();
  const aNum = parseFloat(a);
  const bNum = parseFloat(b);
  const cNum = parseFloat(c);
  const hasValidInputForDisplay =
    !isNaN(aNum) && !isNaN(bNum) && !isNaN(cNum) && a !== "" && b !== "" && c !== "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20" />
        <div className="relative max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl mb-6 text-4xl">
            🧮
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Giải Phương Trình Bậc Hai
          </h1>
          <p className="text-xl text-slate-400 font-mono">
            ax² + bx + c = 0
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Hiển thị đầy đủ các bước giải chi tiết
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16">
        {/* Input Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl mb-8">
          <h2 className="text-lg font-semibold text-slate-300 mb-6 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-500/30 flex items-center justify-center text-sm">✏️</span>
            Nhập các hệ số
          </h2>

          {/* Equation preview */}
          {hasValidInputForDisplay && (
            <div className="mb-6 text-center">
              <div className="inline-block bg-indigo-500/10 border border-indigo-400/30 rounded-2xl px-6 py-3">
                <span className="text-indigo-300 font-mono text-xl font-bold">
                  {buildEquationDisplay(aNum, bNum, cNum)}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Input a */}
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium text-slate-400">
                Hệ số <span className="text-indigo-400 font-bold text-base">a</span>
              </label>
              <div className="relative w-full">
                <input
                  type="number"
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập a"
                  className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3 text-center text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-600"
                />
                <span className="absolute -top-2 right-3 text-xs text-slate-500 bg-slate-900 px-1">ax²</span>
              </div>
            </div>

            {/* Input b */}
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium text-slate-400">
                Hệ số <span className="text-purple-400 font-bold text-base">b</span>
              </label>
              <div className="relative w-full">
                <input
                  type="number"
                  value={b}
                  onChange={(e) => setB(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập b"
                  className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3 text-center text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-slate-600"
                />
                <span className="absolute -top-2 right-3 text-xs text-slate-500 bg-slate-900 px-1">bx</span>
              </div>
            </div>

            {/* Input c */}
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium text-slate-400">
                Hệ số <span className="text-pink-400 font-bold text-base">c</span>
              </label>
              <div className="relative w-full">
                <input
                  type="number"
                  value={c}
                  onChange={(e) => setC(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập c"
                  className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3 text-center text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder-slate-600"
                />
                <span className="absolute -top-2 right-3 text-xs text-slate-500 bg-slate-900 px-1">c</span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-400/30 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSolve}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] text-lg flex items-center justify-center gap-2"
            >
              <span>⚡</span> Giải Phương Trình
            </button>
            <button
              onClick={handleReset}
              className="bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-semibold py-4 px-5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>🔄</span> Làm lại
            </button>
          </div>

          {/* Hint */}
          <p className="text-center text-xs text-slate-600 mt-3">Nhấn Enter để giải nhanh</p>
        </div>

        {/* Solution */}
        {solution && (
          <div key={animateKey} className="space-y-4">
            {/* Badge kết quả tổng quan */}
            {badge && (
              <div className="flex items-center justify-center">
                <div className={`bg-gradient-to-r ${badge.color} text-white font-bold px-6 py-2 rounded-full text-sm shadow-lg`}>
                  📊 Kết quả: {badge.text}
                </div>
              </div>
            )}

            {/* Tiêu đề các bước */}
            <div className="flex items-center gap-3 mt-6 mb-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
              <span className="text-indigo-400 font-semibold text-sm uppercase tracking-widest">Các bước giải</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {solution.steps.map((step, index) => (
                <StepCard key={index} step={step} index={index} />
              ))}
            </div>

            {/* Footer note */}
            <div className="text-center text-xs text-slate-600 pt-4 pb-2">
              ✨ Giải xong — Nhập hệ số mới để giải phương trình khác
            </div>
          </div>
        )}

        {/* Examples */}
        {!solution && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>💡</span> Ví dụ nhanh
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { a: "1", b: "-5", c: "6", label: "x² − 5x + 6 = 0", desc: "2 nghiệm" },
                { a: "1", b: "2", c: "1", label: "x² + 2x + 1 = 0", desc: "Nghiệm kép" },
                { a: "1", b: "0", c: "4", label: "x² + 4 = 0", desc: "Vô nghiệm" },
                { a: "2", b: "-4", c: "2", label: "2x² − 4x + 2 = 0", desc: "Nghiệm kép" },
                { a: "0", b: "3", c: "-9", label: "3x − 9 = 0", desc: "Bậc nhất" },
                { a: "1", b: "-3", c: "-10", label: "x² − 3x − 10 = 0", desc: "2 nghiệm" },
              ].map((ex, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setA(ex.a);
                    setB(ex.b);
                    setC(ex.c);
                    setError("");
                    setSolution(null);
                  }}
                  className="text-left bg-slate-800/40 hover:bg-slate-700/60 border border-white/5 hover:border-indigo-500/40 rounded-xl p-3 transition-all duration-200 hover:scale-[1.02] group"
                >
                  <div className="font-mono text-xs text-indigo-300 group-hover:text-indigo-200 mb-1">{ex.label}</div>
                  <div className="text-xs text-slate-500">{ex.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepCard({ step, index }: { step: SolutionStep; index: number }) {
  let cardClass = "bg-slate-800/40 border border-white/8";
  let labelClass = "text-slate-400";
  let contentClass = "text-slate-200";

  if (step.isResult) {
    cardClass = "bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/40 shadow-lg shadow-emerald-900/20";
    labelClass = "text-emerald-400";
    contentClass = "text-emerald-200 font-bold text-lg";
  } else if (step.isError) {
    cardClass = "bg-gradient-to-r from-red-900/40 to-rose-900/40 border border-red-500/40";
    labelClass = "text-red-400";
    contentClass = "text-red-200 font-semibold";
  } else if (step.isWarning) {
    cardClass = "bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/40";
    labelClass = "text-amber-400";
    contentClass = "text-amber-200 font-semibold";
  } else if (step.highlight) {
    cardClass = "bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/40";
    labelClass = "text-indigo-400";
    contentClass = "text-indigo-200 font-semibold";
  } else if (step.isFormula) {
    cardClass = "bg-slate-800/60 border border-purple-500/30";
    labelClass = "text-purple-400";
    contentClass = "text-purple-200 font-mono";
  }

  return (
    <div
      className={`rounded-xl p-4 ${cardClass} transition-all duration-300`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-3">
        {/* Step number */}
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-slate-500 font-mono mt-0.5">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${labelClass}`}>
            {step.label}
          </div>
          <div className={`font-mono text-sm md:text-base break-words ${contentClass}`}>
            {step.content}
          </div>
        </div>
      </div>
    </div>
  );
}
