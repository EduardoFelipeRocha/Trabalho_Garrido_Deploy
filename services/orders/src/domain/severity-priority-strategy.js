export class SeverityPriorityStrategy {
  calculate({ baseSeverity, description }) {
    const emergencyWords = ["risco", "acidente", "escola", "hospital", "alagamento"];
    const text = description.toLowerCase();
    const hasEmergencySignal = emergencyWords.some((word) => text.includes(word));
    const increment = hasEmergencySignal ? 1 : 0;

    return Math.min(5, baseSeverity + increment);
  }
}
