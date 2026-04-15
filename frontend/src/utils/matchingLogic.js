const CLEANLINESS_MAP = {
  "very flexible": 1,
  "flexible": 2,
  "moderate": 3,
  "strict": 4,
  "very strict": 5
};

const GUEST_TOLERANCE_MAP = {
  "rarely": 1,
  "sometimes": 2,
  "often": 3
};

const NOISE_MAP = {
  "silent": 1,
  "low noise": 2,
  "flexible": 3
};

const WEIGHT_CLEANLINESS  = 25.0;
const WEIGHT_SLEEP        = 20.0;
const WEIGHT_SOCIAL       = 15.0;
const WEIGHT_OCCUPATION   = 15.0;
const WEIGHT_GUEST        = 12.5;
const WEIGHT_NOISE        = 12.5;

function isGenderAccepted(preferredGender, actualGender) {
  if (!preferredGender || !actualGender) return true;
  if (preferredGender.toLowerCase() === "any") return true;
  return preferredGender.toLowerCase().includes(actualGender.toLowerCase());
}

function passesHardRules(request, housemate) {
  // Gender
  if (!isGenderAccepted(request.preferredGender, housemate.gender)) return false;
  if (!isGenderAccepted(housemate.preferredGender, request.gender)) return false;

  // Budget
  if (request.maxBudget && request.maxBudget > 0 && housemate.budget != null) {
      const maxAllowed = request.maxBudget * 1.30;
      if (housemate.budget > maxAllowed) return false;
  }

  // Smoking
  if (request.smokingPreference && housemate.smokingPreference && request.smokingPreference.toLowerCase() !== "no preference") {
      if (request.smokingPreference.toLowerCase() === "non-smoker") {
          if (housemate.smokingPreference.toLowerCase() !== "non-smoker") return false;
      }
  }

  return true;
}

export function calculateCompatibility(request, housemate) {
  if (!passesHardRules(request, housemate)) return null;

  let totalScore = 0.0;
  let reasons = [];

  // Gender Reason
  if (request.gender && housemate.gender) {
      if (request.gender.toLowerCase() === housemate.gender.toLowerCase()) {
          reasons.push("Same gender");
      } else {
          reasons.push("Gender compatible");
      }
  }
  // Budget Reason
  if (request.maxBudget && housemate.budget != null) {
      if (housemate.budget <= request.maxBudget) {
          reasons.push(`Within budget (RM ${Math.floor(housemate.budget)})`);
      } else {
          reasons.push(`Slightly above budget (RM ${Math.floor(housemate.budget)})`);
      }
  }
  // Smoking Reason
  if (request.smokingPreference && housemate.smokingPreference) {
      if (request.smokingPreference.toLowerCase() === housemate.smokingPreference.toLowerCase()) {
          reasons.push("Same smoking preference");
      }
  }

  // Cleanliness
  if (!request.cleanlinessLevel || !housemate.cleanlinessLevel) {
      totalScore += WEIGHT_CLEANLINESS;
  } else {
      let userLevel = parseInt(request.cleanlinessLevel);
      let mateLevel = CLEANLINESS_MAP[housemate.cleanlinessLevel.toLowerCase()] || 3;
      let diff = Math.abs(userLevel - mateLevel);
      if (diff === 0) { totalScore += WEIGHT_CLEANLINESS; reasons.push("Similar cleanliness standards"); }
      else if (diff === 1) { totalScore += WEIGHT_CLEANLINESS * 0.75; reasons.push("Close cleanliness standards"); }
      else if (diff === 2) { totalScore += WEIGHT_CLEANLINESS * 0.4; }
      else { totalScore += WEIGHT_CLEANLINESS * 0.1; }
  }

  // Sleep
  if (!request.sleepSchedule || !housemate.sleepSchedule) {
      totalScore += WEIGHT_SLEEP;
  } else {
      let userSleep = request.sleepSchedule.toLowerCase();
      let mateSleep = housemate.sleepSchedule.toLowerCase();
      if (userSleep === mateSleep) { totalScore += WEIGHT_SLEEP; reasons.push(`Same sleep schedule (${housemate.sleepSchedule})`); }
      else if (userSleep === "flexible" || mateSleep === "flexible") { totalScore += WEIGHT_SLEEP * 0.75; reasons.push("Flexible sleep schedule"); }
  }

  // Social
  if (!request.socialLevel || housemate.socialLevel == null) {
      totalScore += WEIGHT_SOCIAL;
  } else {
      let userLevel = parseInt(request.socialLevel);
      let mateLevel = parseInt(housemate.socialLevel);
      let diff = Math.abs(userLevel - mateLevel);
      if (diff === 0) { totalScore += WEIGHT_SOCIAL; reasons.push("Same social preference"); }
      else if (diff === 1) { totalScore += WEIGHT_SOCIAL * 0.75; reasons.push("Compatible social preference"); }
      else if (diff === 2) { totalScore += WEIGHT_SOCIAL * 0.4; }
      else { totalScore += WEIGHT_SOCIAL * 0.1; }
  }

  // Occupation
  if (!request.occupationType || !housemate.occupationType) {
      totalScore += WEIGHT_OCCUPATION;
  } else {
      if (request.occupationType.toLowerCase() === housemate.occupationType.toLowerCase()) {
          totalScore += WEIGHT_OCCUPATION;
          reasons.push(`Same occupation type (${housemate.occupationType})`);
      } else {
          totalScore += WEIGHT_OCCUPATION * 0.3;
      }
  }

  // Guest
  if (!request.guestTolerance || !housemate.guestTolerance) {
      totalScore += WEIGHT_GUEST;
  } else {
      let userLevel = GUEST_TOLERANCE_MAP[request.guestTolerance.toLowerCase()] || 2;
      let mateLevel = GUEST_TOLERANCE_MAP[housemate.guestTolerance.toLowerCase()] || 2;
      let diff = Math.abs(userLevel - mateLevel);
      if (diff === 0) { totalScore += WEIGHT_GUEST; reasons.push("Similar guest tolerance"); }
      else if (diff === 1) { totalScore += WEIGHT_GUEST * 0.6; }
      else { totalScore += WEIGHT_GUEST * 0.2; }
  }

  // Noise
  if (!request.studyNoisePreference || !housemate.studyNoisePreference) {
      totalScore += WEIGHT_NOISE;
  } else {
      let userLevel = NOISE_MAP[request.studyNoisePreference.toLowerCase()] || 2;
      let mateLevel = NOISE_MAP[housemate.studyNoisePreference.toLowerCase()] || 2;
      let diff = Math.abs(userLevel - mateLevel);
      if (diff === 0) { totalScore += WEIGHT_NOISE; reasons.push("Same noise/study preference"); }
      else if (diff === 1) { totalScore += WEIGHT_NOISE * 0.6; }
      else { totalScore += WEIGHT_NOISE * 0.2; }
  }

  totalScore = Math.round(totalScore * 10.0) / 10.0;

  let label = "Fair Match";
  if (totalScore >= 85) label = "Best Match";
  else if (totalScore >= 65) label = "Good Match";

  return {
    housemateProfile: housemate,
    compatibilityScore: totalScore,
    matchLabel: label,
    reasons: reasons
  };
}
