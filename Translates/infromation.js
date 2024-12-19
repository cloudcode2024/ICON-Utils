/**
 *  Traduce todos los check information al array de idiomas definidos
 */
const ARRNEWLAN = ["en", "ca", "pt", "fr", "it", "de"];

/** Don't touch */
const USER_CODE = Ax.ext.user.getCode();
const DATE_CURRENT = new Ax.util.Date();

function translate(data, newlang){
    try{
        return Ax.ext.google.translate.translateText('es', newlang, data) ?? '';
    } catch(err){
        return ''
    }
}

ARRNEWLAN.forEach(NEWLANG =>{
    let mRsDetalle = Ax.db.executeQuery(`
        SELECT '${NEWLANG}' locale_tar, 
            alert.locale,
            alert.alert_id, 
            alert.alert_title,
            alert.alert_text 
          FROM wic_obj_base_form_box_tab_alert_locale alert
         WHERE alert.locale = 'es' AND 
                NOT EXISTS (SELECT id 
                              FROM wic_obj_table_check_info t 
                             WHERE t.id = alert.id
                               AND t.locale='${NEWLANG}')
    `);


    mRsDetalle.forEach(data => {
        try{
            Ax.db.beginWork();

            if (!data.alert_title) return

            let memo_translate = translate(data.alert_title, NEWLANG).toString();
            data.alert_title = memo_translate[0].toUpperCase() + memo_translate.slice(1)

            let memo_text = translate(data.alert_text, NEWLANG).toString();
            data.alert_text = memo_text[0].toUpperCase() + memo_text.slice(1)

            Ax.db.insert('wic_obj_base_form_box_tab_alert_locale', {
                locale      : NEWLANG,
                alert_id    : data.alert_id,
                alert_title : data.alert_title,
                alert_text  : data.alert_text, 				
            }); 

            Ax.db.commitWork();
            console.log("Successfull translating:", data.alert_title);
        }catch(err) {
            console.log("Error translating:", err);
            Ax.db.rollbackWork();
        }
    })

})


 
