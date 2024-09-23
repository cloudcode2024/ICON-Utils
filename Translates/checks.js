/**
 *  Traduce todos los check information al array de idiomas definidos
 */
const ARRNEWLAN = ["en", "ca", "pt", "fr", "it", "de"];

/** Don't touch */
const USER_CODE = Ax.ext.user.getCode();
const DATE_CURRENT = new Ax.util.Date();

function translate(data){
    try{
        return Ax.ext.google.translate.translateText('es', NEWLANG, data) ?? '';
    } catch(err){
        return ''
    }
}

ARRNEWLAN.forEach(NEWLANG =>{
    let mRsDetalle = Ax.db.executeQuery(`
        SELECT '${NEWLANG}' locale_tar, 
        wic_obj_table_check_info.locale,
        wic_obj_table_check_info.tabname, 
        wic_obj_table_check_info.constraint_name,
        wic_obj_table_check_info.constraint_desc 
      FROM wic_obj_table_check_info
     WHERE wic_obj_table_check_info.locale = 'es' AND 
            NOT EXISTS (SELECT rowid 
                          FROM wic_obj_table_check_info t 
                         WHERE t.tabname = wic_obj_table_check_info.tabname
                           AND t.constraint_name = wic_obj_table_check_info.constraint_name
                           AND t.locale='${NEWLANG}')
    `);


    mRsDetalle.forEach(data => {
        try{
            Ax.db.beginWork();

            if (!data.constraint_desc) return

            let memo_translate = translate(data.constraint_desc).toString();
            data.constraint_desc = memo_translate[0].toUpperCase() + memo_translate.slice(1)

            Ax.db.insert('wic_obj_table_check_info', {
                locale          : NEWLANG,
                tabname         : data.tabname,
                constraint_name : data.constraint_name,
                constraint_desc : data.constraint_desc, 				
                user_created    : USER_CODE,
                user_updated    : USER_CODE,
                date_created    : DATE_CURRENT,
                date_updated    : DATE_CURRENT
            }); 

            Ax.db.commitWork();
            console.log("Successfull translating:", data.constraint_name);
        }catch(err) {
            console.log("Error translating:", err);
            Ax.db.rollbackWork();
        }
    })

})


 
