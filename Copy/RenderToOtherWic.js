/**
 *  Copia un render con la definicion, referencias y traduciones de otra wic
 */

const WICORIGEN    = Ax.db.of('wic_icon');
const WICDESTINO   = Ax.db.of('wic_icon_pe');
const RENDER_CODEARR = ['textract_file_format']
const NOT_REFTABLE = ['*'] // Array de nombre de tablas en las referencias que se exculye al copiar.
const LANGUAJE_COP = ['es', 'en', 'ca'];


/* Dont touch */
const USER_CODE    = Ax.ext.user.getCode();
const DATE_CURRENT = new Ax.util.Date();

RENDER_CODEARR.forEach(RENDER_CODE =>{
    try{
        const mRSHead = WICORIGEN.executeQuery(`
         SELECT 
               render_code,	render_type,	json_data,
               sql_data,	json_conf, ? AS user_created,
               CURRENT AS	date_created, ? AS user_updated,
               CURRENT AS date_updated  
          FROM wic_obj_base_column_render 
         WHERE render_code = ?
        `, RENDER_CODE, USER_CODE, USER_CODE).toJSONArray()

        if(mRSHead.length == 0) return console.log('Render no encontrado: ', RENDER_CODE)

        const mRSConec = WICORIGEN.executeQuery(`
         SELECT 
                 locale,	render_code,	render_data,
                 render_desc, 	render_info, ? AS user_created,
                CURRENT AS	date_created, ? AS user_updated,
                CURRENT AS date_updated  
          FROM wic_obj_base_column_render_locale 
         WHERE render_code = ? AND locale IN('${LANGUAJE_COP.join(`','`)}')
        `, RENDER_CODE, USER_CODE, USER_CODE).toJSONArray()

        const mRSCAL = WICORIGEN.executeQuery(`
         SELECT tabname,	colname,	render_code, ? AS user_created,
                CURRENT AS	date_created, ? AS user_updated,
                CURRENT AS date_updated   
          FROM wic_obj_base_column_render_map 
         WHERE render_code = ? 
           AND tabname NOT IN ('${NOT_REFTABLE.join(`','`)}')
        `, RENDER_CODE, USER_CODE, USER_CODE).toJSONArray()

        WICDESTINO.insert('wic_obj_base_column_render', mRSHead)
        WICDESTINO.insert('wic_obj_base_column_render_locale', mRSConec)
        WICDESTINO.insert('wic_obj_base_column_render_map', mRSCAL)

        console.log('Render copiado: ', RENDER_CODE)

    }catch(err) {
        console.log(`Error al copiar render ${RENDER_CODE} : ${err} `)
    }
})