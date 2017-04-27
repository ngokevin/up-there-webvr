// a few handy astronomical constants
const SOL_TO_KM = 695700
    , PARSEC_TO_KM = 3.086e13
    , KM_TO_PARSEC = 1/PARSEC_TO_KM
    , PARSEC_TO_LY = 3.26156
    , LY_TO_PARSEC = 1 / PARSEC_TO_LY
    , LY_TO_KM = LY_TO_PARSEC * PARSEC_TO_KM
    , AU_TO_PARSEC = 4.84814e-6
    , PARSEC_TO_AU = 1 / AU_TO_PARSEC
    , AU_TO_KM = AU_TO_PARSEC * PARSEC_TO_KM
    , SOL_TO_PARSECS = SOL_TO_KM * KM_TO_PARSEC

module.exports = {
  // a few astronomical constants that are handy
  SOL_TO_KM: 695700,
  PARSEC_TO_KM: 3.086e13,
  KM_TO_PARSEC: 1/PARSEC_TO_KM,
  PARSEC_TO_LY: 3.26156,
  LY_TO_PARSEC: 1 / PARSEC_TO_LY,
  LY_TO_KM: LY_TO_PARSEC * PARSEC_TO_KM,
  AU_TO_PARSEC: 4.84814e-6,
  PARSEC_TO_AU: 1 / AU_TO_PARSEC,
  AU_TO_KM: AU_TO_PARSEC * PARSEC_TO_KM,
  SOL_TO_PARSECS: SOL_TO_KM * KM_TO_PARSEC,
  // helper functions
  solsToKm: function(sols) {
    return sols * SOL_TO_KM
  }
}
