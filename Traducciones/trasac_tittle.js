/**
 *  Traduce todos los nombres de los transaccionales al array de idiomas definidos
 */
const ARRNEWLAN = ["en", "ca", "pt", "fr", "it", "de"];

/** Don't touch */
const USER_CODE = Ax.ext.user.getCode();
const DATE_CURRENT = new Ax.util.Date();

function translate(data) {
  try {
    return Ax.ext.google.translate.translateText("es", NEWLANG, data) ?? "";
  } catch (err) {
    return "";
  }
}

ARRNEWLAN.forEach((NEWLANG) => {
  console.log(`-----------------${NEWLANG}-----------------`);
  
  function translate(data) {
    try {
      return Ax.ext.google.translate.translateText("es", NEWLANG, data);
    } catch (err) {
      return "";
    }
  }

  let mRsDetalle = Ax.db.executeQuery(`
    SELECT
            '${NEWLANG}' locale_tar, 
            wic_obj_base_text_info.locale,
            wic_obj_base.obj_type, 
            wic_obj_base_text_info.obj_code,
            wic_obj_base_text_info.obj_memo,
            wic_obj_base_text_info.obj_head,
            wic_obj_base_text_info.obj_info 
      FROM wic_obj_base_text_info,wic_obj_base
     WHERE wic_obj_base.obj_code = wic_obj_base_text_info.obj_code
       AND locale = 'es'
       AND NOT EXISTS (SELECT obj_code 
                         FROM wic_obj_base_text_info t 
                        WHERE t.obj_code = wic_obj_base_text_info.obj_code 
                          AND t.locale='${NEWLANG}')
    `);

  mRsDetalle.forEach((data) => {
    try {
      Ax.db.beginWork();

      if (!data.obj_head) return;

      let memo_translate = translate(data.obj_head).toString();
      data.obj_head = memo_translate.toUpperCase();

      if (data.obj_memo) {
        let desc_translate = translate(data.obj_memo);
        data.obj_memo = desc_translate
          ? desc_translate[0].toUpperCase() + desc_translate.slice(1)
          : "";
      }

      if (data.obj_info) {
        let desc_translate = translate(data.obj_info);
        data.obj_info = desc_translate
          ? desc_translate[0].toUpperCase() + desc_translate.slice(1)
          : "";
      }

      Ax.db.insert("wic_obj_base_text_info", {
        locale: NEWLANG,
        audited: 0,
        obj_code: data.obj_code,
        obj_head: data.obj_head,
        obj_memo: data.obj_memo,
        obj_info: data.obj_info,
        page_id: data.page_id,
        user_created: USER_CODE,
        user_updated: USER_CODE,
        date_created: DATE_CURRENT,
        date_updated: DATE_CURRENT,
      });

      Ax.db.commitWork();
      console.log("Successfull translating:", data.obj_head);
    } catch (err) {
      console.log("Error translating:", err);
      Ax.db.rollbackWork();
    }
  });
});
