const TABNAME = "capuimpl";
const NEWTABNAME = "pe_capuimpl";

/* Don't touch */
try {
  Ax.db.beginWork();
  Ax.db.execute(`
        UPDATE wic_obj_base_column_output SET tabname='${NEWTABNAME}' WHERE tabname='${TABNAME}';
        UPDATE wic_table_blobdefs SET tabname='${NEWTABNAME}' WHERE tabname='${TABNAME}';
        UPDATE wic_obj_base_column_render_map SET tabname='${NEWTABNAME}' WHERE tabname='${TABNAME}';
        UPDATE wic_obj_table SET tabname='${NEWTABNAME}', obj_code='${NEWTABNAME}' WHERE tabname='${TABNAME}';
        UPDATE wic_obj_base_inputqry SET qry_tabname='${NEWTABNAME}' WHERE qry_tabname='${TABNAME}';
        UPDATE wic_obj_table_column_display SET out_tabname='${NEWTABNAME}' WHERE out_tabname='${TABNAME}';
        UPDATE wic_jdic_tabdata SET tab_name='${NEWTABNAME}' WHERE tab_name='${TABNAME}';
        UPDATE wic_jdic_coldata SET tab_name='${NEWTABNAME}' WHERE tab_name='${TABNAME}';
        UPDATE wic_obj_table_pkey SET pk_table='${NEWTABNAME}', 
            pk_sql_search = REPLACE(pk_sql_search, '${TABNAME}', '${NEWTABNAME}'),
            pk_sql_verify = REPLACE(pk_sql_verify, '${TABNAME}', '${NEWTABNAME}') WHERE pk_table ='${TABNAME}';
        UPDATE wic_obj_table_fkey SET pk_table='${NEWTABNAME}', 
            pk_condition = REPLACE(pk_condition, '${TABNAME}', '${NEWTABNAME}')  WHERE pk_table ='${TABNAME}';
    `);
  Ax.db.commitWork();
  console.log(`tabname ${TABNAME} changed to ${NEWTABNAME}`);
} catch (err) {
  Ax.db.rollbackWork;
  console.log("Error to change tabname: ", err);
}
