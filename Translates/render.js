/**
 *  Traduce todos los renders al array de idiomas definidos
 */
const ARRAYNEWLANGS = ["en", "ca", "pt", "fr", "it", "de"];

/** Don't touch */
const USER_CODE = Ax.ext.user.getCode();
const DATE_CURRENT = new Ax.util.Date();

ARRAYNEWLANGS.forEach((NEWLANG) => {
  function translate(data) {
    try {
      return Ax.ext.google.translate.translateText("es", NEWLANG, data) ?? "";
    } catch (err) {
      return "";
    }
  }

  let mRsDetalle = Ax.db.executeQuery(`
        SELECT '${NEWLANG}' locale_tar, 
            wic_obj_base_column_render_locale.locale,
            wic_obj_base_column_render_locale.render_code, 
            wic_obj_base_column_render_locale.render_data,
            wic_obj_base_column_render_locale.render_desc
          FROM wic_obj_base_column_render_locale
         WHERE wic_obj_base_column_render_locale.locale = 'es' AND 
                NOT EXISTS (SELECT rowid 
                              FROM wic_obj_base_column_render_locale t 
                             WHERE t.render_code = wic_obj_base_column_render_locale.render_code
                               AND t.render_data = wic_obj_base_column_render_locale.render_data
                               AND t.locale='${NEWLANG}')
    `);

  mRsDetalle.forEach((data) => {
    try {
      Ax.db.beginWork();

      if (!data.render_desc) return;

      let memo_translate = translate(data.render_desc).toString();
      data.render_desc =
        memo_translate[0].toUpperCase() + memo_translate.slice(1);

      if (data.render_info) {
        let desc_translate = translate(data.render_info);
        data.render_info = desc_translate
          ? desc_translate[0].toUpperCase() + desc_translate.slice(1)
          : "";
      }

      Ax.db.insert("wic_obj_base_column_render_locale", {
        locale: NEWLANG,
        render_code: data.render_code,
        render_data: data.render_data,
        render_desc: data.render_desc,
        render_info: data.render_info,
        user_created: USER_CODE,
        user_updated: USER_CODE,
        date_created: DATE_CURRENT,
        date_updated: DATE_CURRENT,
      });

      Ax.db.commitWork();
      console.log(`Successfull translating(${NEWLANG}):`, data.render_code);
    } catch (err) {
      console.log(`Error translating(${NEWLANG}):`, err);
      Ax.db.rollbackWork();
    }
  });
});
