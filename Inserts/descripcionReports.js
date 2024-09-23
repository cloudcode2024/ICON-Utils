/**
 *  Inserta y traduce nombre de reportes.
 */

const OBJINITIAL = {
  originlag: "es",
  langDes: ["es", "ca", "en", "pt", "it", "fr", "de"],
  report_name: "pe_sunat_padron_agente_retenc_rep",
  desc_large: "REPORTE DE AGENTES DE RETENCIÓN",
  desc_small: "Reporte de agentes de retención",
};

/** Don't touch */
function translate(data, langorig, lang) {
  try {
    if (langorig == lang) return data;
    return Ax.ext.google.translate.translateText(langorig, lang, data);
  } catch (err) {
    return "";
  }
}

const USER_CODE = Ax.ext.user.getCode();
const DATE_CURRENT = new Ax.util.Date();

OBJINITIAL.langDes.forEach((lang) => {
  try {
    Ax.db.insert("wic_obj_base_text_info", {
      locale: lang,
      audited: 0,
      obj_code: OBJINITIAL.report_name,
      obj_head: translate(
        OBJINITIAL.desc_large,
        OBJINITIAL.originlag,
        lang
      ).toUpperCase(),
      obj_memo: translate(OBJINITIAL.desc_small, OBJINITIAL.originlag, lang),
      obj_info: null,
      page_id: null,
      user_created: USER_CODE,
      date_created: DATE_CURRENT,
      user_updated: USER_CODE,
      date_updated: DATE_CURRENT,
    });
    console.log(`Inserccion correcta ${lang}`);
  } catch (err) {
    console.log(`Fallo a ingresar traduccion ${lang}: ${err}`);
  }
});
