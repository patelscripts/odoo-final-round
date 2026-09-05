// Resolves salary rule sequence into a breakdown + gross/net
exports.computeSalary = (rules, baseWage) => {
  const values = { WAGE: baseWage }; // seed value for formulas/percentage refs
  const breakdown = [];
  let gross = 0;
  let deductions = 0;

  const sortedRules = [...rules].sort((a, b) => a.sequence - b.sequence);

  for (const rule of sortedRules) {
    let amount = 0;

    if (rule.computationType === "fixed") {
      amount = rule.amount || 0;
    } else if (rule.computationType === "percentage") {
      const base = values[rule.percentageOf] || 0;
      amount = (base * (rule.percentageValue || 0)) / 100;
    } else if (rule.computationType === "formula") {
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function(...Object.keys(values), `return ${rule.formula};`);
        amount = fn(...Object.values(values));
      } catch {
        amount = 0;
      }
    }

    amount = +amount.toFixed(2);
    values[rule.code] = amount;

    breakdown.push({
      code: rule.code,
      name: rule.name,
      category: rule.category,
      amount,
    });

    if (rule.category === "allowance" || rule.category === "basic") gross += amount;
    if (rule.category === "deduction") deductions += amount;
  }

  const netSalary = +(gross - deductions).toFixed(2);
  return { breakdown, grossSalary: +gross.toFixed(2), totalDeductions: +deductions.toFixed(2), netSalary };
};