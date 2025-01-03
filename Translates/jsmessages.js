/**
 *  Traduce todos js message al array de idiomas definidos
 */
const ARRNEWLAN = ["en", "ca"];

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
    console.log(`-----------------${NEWLANG}-----------------`);
    let mRsDetalle = Ax.db.executeQuery(`
        SELECT '${NEWLANG}' locale_tar, 
            message.msg_lang,
            message.msg_code, 
            message.msg_text
          FROM wic_javascript_message message
         WHERE message.msg_lang = 'es' AND 
                NOT EXISTS (SELECT msg_code 
                              FROM wic_javascript_message mess 
                             WHERE mess.msg_code = message.msg_code
                               AND mess.msg_lang ='${NEWLANG}')
    `);


    mRsDetalle.forEach(data => {
        try{
            Ax.db.beginWork();

            if (!data.msg_text) return

            let memo_translate = translate(data.msg_text, NEWLANG).toString();
            data.msg_text = memo_translate[0].toUpperCase() + memo_translate.slice(1)

            Ax.db.insert('wic_javascript_message', {
                msg_lang    : NEWLANG,
                msg_text    : data.msg_text,
                msg_code    : data.msg_code,
                user_created : USER_CODE,
                date_created : DATE_CURRENT,
                user_updated : USER_CODE,
                date_updated : DATE_CURRENT			
            }); 

            Ax.db.commitWork();
            console.log("Successfull translating:", data.msg_text);
        }catch(err) {
            console.log("Error translating:", err);
            Ax.db.rollbackWork();
        }
    })

})


 
