/**
 *  Copyright (c) 1988 - PRESENT deister software, All Rights Reserved.
 *
 *  All information contained herein is, and remains the property of deister software.
 *  The intellectual and technical concepts contained herein are proprietary to
 *  deister software and may be covered by trade secret or copyright law.
 *  Dissemination of this information or reproduction of this material is strictly
 *  forbidden unless prior written permission is obtained from deister software.
 *  Access to the source code contained herein is hereby forbidden to anyone except
 *  current deister software employees, managers or contractors who have executed
 * "Confidentiality and Non-disclosure" agreements explicitly covering such access.
 *  The copyright notice above does not evidence any actual or intended publication
 *  for disclosure of this source code, which includes information that is confidential
 *  and/or proprietary, and is a trade secret, of deister software
 *
 *  ANY REPRODUCTION, MODIFICATION, DISTRIBUTION, PUBLIC  PERFORMANCE,
 *  OR PUBLIC DISPLAY OF OR THROUGH USE  OF THIS  SOURCE CODE  WITHOUT THE
 *  EXPRESS WRITTEN CONSENT OF COMPANY IS STRICTLY PROHIBITED, AND IN VIOLATION
 *  OF APPLICABLE LAWS AND INTERNATIONAL TREATIES.THE RECEIPT OR POSSESSION OF
 *  THIS SOURCE CODE AND/OR RELATED INFORMATION DOES NOT CONVEY OR IMPLY ANY
 *  RIGHTS TO REPRODUCE, DISCLOSE OR DISTRIBUTE ITS CONTENTS, OR TO MANUFACTURE,
 *  USE, OR SELL ANYTHING THAT IT MAY DESCRIBE, IN WHOLE OR IN PART.
 *  -----------------------------------------------------------------------------
 *
 *  FUNCTION JS: cval_carvalo_inter
 *
 *  Version:    V1.0
 *  Date:       2024.09.18
 *  Description: Proceso para la generación de la provision de intereses de las carteras
 *    de valores
 *
 *  PARAMETERS:
 *  =============
 *  @param      {string}       pStrCodcar      description
 *  @param      {string}       pStrCodcal      description
 *  @param      {Date}         pDateFecha      description
 *
 */
function cvalCarvaloInter(pStrCodcar, pStrCodcal, pDateFecha) {

    /**================================= *
     *   Datos por defecto del usuario   *
     * ================================= */
    const CURRENT_USER = Ax.ext.user.getCode();
    const CURRENT_DATE = new Ax.sql.Date();
    const mQueryDate = new Ax.sql.Date(pDateFecha).toSQLQueryString()
    const mRowUserDefaults = Ax.db.executeProcedure("cdefcont_defaults", Ax.ext.user.getCode(), 'casientos').toOne(); //casientos

    if (!mRowUserDefaults.diario) throw new Ax.ext.Exception("CVAL_CARVALO_INTER1", "cval_carvalo_inter: Valor diario predeterminado del usuario no informado!.");

    /**================================================================ *
     *   Verificamos operaciones anteriores pendientes de contabilizar  *
     * ================================================================ */
    if (Ax.db.executeGet(`
            <select>
                <columns>
                    COUNT(*) count
                </columns>
                <from table='cval_opercar'/>
                <where>
                        cval_opercar.codcar LIKE '%${pStrCodcar}%'
                    AND cval_opercar.codval LIKE '%${pStrCodcal}%'
                    AND cval_opercar.fecope &lt;= ${mQueryDate}
                    AND cval_opercar.estado != 'C'
                </where>
            </select>
        `) > 0
    ) throw new Ax.ext.Exception("CVAL_CARVALO_INTER2", "cval_carvalo_inter: Operaciones con fecha anterior pendientes de contabilizar.");

    const mRsCvalCarvalo = Ax.db.executeQuery(`
        <select>
            <columns>
                cval_carvalo.operid, cval_carvalo.empcode, cval_carvalo.codcar, cval_carvalo.codval,
                cval_carvalo.feccom, cval_carvalo.numtit,  cval_carvalo.moneda, cval_carvalo.precio,
                cval_carvalo.totdiv, cval_carvalo.totloc,  cval_carvalo.totnom, cval_carvalo.totact,
                cval_carvalo.imptot, cval_carvalo.fecemi,  cval_carvalo.fecini, cval_carvalo.fecfin,
                cval_carvalo.tipint, cval_carvalo.tippag,  cval_carvalo.fecabo, cval_carvalo.impabo,
                cval_carvalo.fecpro, cval_carvalo.imppro,  cval_carvalo.fecint, cval_carvalo.impint,
                cval_carvalo.fecven, cval_carvalo.impven,
                cval_tipcart.nomcar, cval_tipcart.empcode, cval_tipcart.proyec, cval_tipcart.seccio,
                cval_tipcart.sistem, cval_tipcart.codagr,  cval_agrcart.cosmed,
                cval_carvalc.numtit  carvalc_numtit,       cval_carvalc.impmed, cval_carvalc.impcos,
                cval_valores.nomval, cval_valores.tipren,  cval_valores.codcon,
                icon_get_ctanem(cval_carvalo.empcode,cval_valctas.ctaire) ctaire,
                icon_get_ctanem(cval_carvalo.empcode,cval_valctas.ctainv) ctainv,
                icon_get_ctanem(cval_carvalo.empcode,cval_valctas.ctaper) ctaper,
                icon_get_camope(cval_carvalo.empcode, cval_carvalo.moneda, ${mQueryDate}) camope,
                icon_get_cambio(cval_carvalo.empcode, cval_carvalo.moneda, ${mQueryDate}) cambio,
                cempresa.placon,    cperiodo.ejerci,    cperiodo.codigo period,
                cempresa.divemp moneda_empresa,
                icon_get_divred(icon_get_moneda(cempresa.empcode)) redondeo
            </columns>
            <from table='cval_carvalo'>
                <join table='cempresa'>
                    <on>cempresa.empcode = cval_carvalo.empcode</on>
                </join>
                <join table='cperiodo' type='left'>
                    <on>cperiodo.empcode = cempresa.empcode</on>
                    <on> ${mQueryDate} BETWEEN cperiodo.fecini AND cperiodo.fecfin</on>
                </join>

                <join table='cval_valores'>
                    <on>cval_valores.codigo = cval_carvalo.codval</on>
                </join>
                <join table='cval_valctas' type='left'>
                    <on>cval_valctas.codcon = cval_valores.codcon</on>
                </join>

                <join table='cval_tipcart' type='left'>
                    <on>cval_tipcart.codcar = cval_carvalo.codcar</on>
                </join>

                <join table='cval_agrcart' type='left'>
                    <on>cval_agrcart.codagr = cval_tipcart.codagr</on>
                </join>
                <join table='cval_carvalc' type='left'>
                    <on>cval_carvalc.codagr = cval_tipcart.codagr</on>
                    <on>cval_carvalc.codval = cval_carvalo.codval</on>
                </join>
            </from>
            <where>
                    cval_carvalo.codcar = '${pStrCodcar}'
                AND cval_carvalo.codval = '${pStrCodcal}'
                AND cval_carvalo.feccom  &lt;= ${mQueryDate}
                AND (cval_carvalo.fecabo &lt;= ${mQueryDate} OR cval_carvalo.fecabo IS NULL)
                AND cval_valores.tipren = 'F'
                AND cval_carvalo.numtit &gt; 0
            </where>
            <order>fecpro, operid</order>
        </select>    
    `).toMemory();


    mRsCvalCarvalo.cursor()
        .afterAll(mRowAfterall => {
            //if( mRowUserDefaults.conint == 1) 
            //Ax.db.call('ccon_interfase_contab', 
            //        0,                             // Ejecucion modo online
            //        1,                             // Borrado de registros al finalizar
            //        mRowAfterall.numlot,          //No hay numlot
            //        mRowAfterall.doclot,          //No hay doclot
            //        mRowAfterall.tipcla           //No hay ticla
            //)
        })
        .group('empcode, feccom')
        .before(mRowBefore => {

            /**=============================== *
             *   Inserta el asiento contable   *
             * =============================== */
            const mRowCasientos = {
                "id_asiento": 0,
                "empcode": mRowBefore.empcode,
                "fecha": pDateFecha,
                "ejercicio": mRowBefore.ejerci,
                "periodo": mRowBefore.period,
                "diario": mRowUserDefaults.diario,
                "moneda": mRowBefore.moneda,        // Moneda de operacion
                "cambio": mRowBefore.cambio,
                "camope": mRowBefore.camope,
                "sistem": mRowUserDefaults.sistem,
                "estado": 'P',                      // Usa el default de la base de datos
                "origen": 'cval_opercar',           // El nombre de la tabla de cartera de valores
                "id_origen": mRowBefore.operid,        // Id de operacion de cartera
                "imp_cuadre": 0,
                "max_orden": 0,
                "user_created": CURRENT_USER,
                "date_created": CURRENT_DATE,
                "user_updated": CURRENT_USER,
                "date_updated": CURRENT_DATE
            }

            mRowBefore.id_asiento = Ax.db.insert('casientos', mRowCasientos).getSerial();

            /**==================================================== *
             *   Insertamos los apuntes relacionado ala operacion   *
             * ==================================================== */
            mRowBefore.Procid = Ax.db.insert('cval_prohist',
                {
                    "procid": 0,
                    "apteid": mRowCasientos.id_asiento,
                    "codcar": pStrCodcar,
                    "codval": pStrCodcal,
                    "fecpro": pDateFecha,
                    "tippro": "F",
                    "user_created": CURRENT_USER,
                    "date_created": CURRENT_DATE,
                    "user_updated": CURRENT_USER,
                    "date_updated": CURRENT_DATE
                }
            ).getSerial()
        })

        .after(mRowAfter => {
            /**===================================================================== *
             *   Deshace la provision anterior de intereses,provision de intereses   *
             *   e intereses vencidos no cobrados.                                   *
             * ===================================================================== */
            let mDateFecabo = mRowAfter.fecabo ?? mRowAfter.fecini;
            if (mDateFecabo == null) throw new Ax.ext.Exception("CVAL_CARVALO_INTER3", "cval_carvalo_inter: Fecha devengo intereses no informada.");


            if (new Ax.sql.Date(mDateFecabo).getTime() <= new Ax.sql.Date(pDateFecha).getTime()) {
                /**============================================================== *
                 *   Ahora que podemos poner descripciones a los valores de los   *
                 *   campos, podriamos convertir p_tippag en smallint y que       *
                 *   contenga directamente el numero de meses                     *
                 * ============================================================== */
                let mIntPeriod = 1;
                switch (mRowAfter.tippag) {
                    case 'A':
                        mIntPeriod = 12;
                        break;
                    case 'S':
                        mIntPeriod = 6;
                        break;
                    case 'T':
                        mIntPeriod = 3;
                        break;
                    default:
                        mIntPeriod = 1;
                }

                let mIntYear = new Ax.sql.Date(mDateFecabo).getYear();
                let mIntMonth = new Ax.sql.Date(mDateFecabo).getMonth() + 1;
                let mDateFecbas = mDateFecabo;
                let mIntDay = 0;

                for (let index = 1; index <= 20; index++) {
                    mIntMonth += mIntPeriod;

                    if (mIntMonth > 12) {
                        mIntMonth -= 12;
                        mIntYear += 1;
                    }

                    mIntMonth = (mIntMonth == 2 && new Ax.sql.Date(mDateFecbas).getDate() > 28)
                        ? 28
                        : ((mIntMonth == 4 || mIntMonth == 6 || mIntMonth == 9 || mIntMonth == 11) && new Ax.sql.Date(mDateFecabo).getDate() > 30)
                            ? 30
                            : new Ax.sql.Date(mDateFecabo).getDate()

                    if (new Ax.sql.Date(mIntDay, mIntMonth, mIntYear).getTime() > new Ax.sql.Date(pDateFecha).getTime()) break;

                    mDateFecbas = new Ax.sql.Date(mIntMonth, mIntDay, mIntYear);
                }

                if (new Ax.sql.Date(mDateFecbas).getTime() <= new Ax.sql.Date(mRowAfter.fecini).getTime()) {

                    let mIntInteresVenc = Ax.math.bc.of(
                        ((mRowAfter.totnom) *
                            (mRowAfter.tipint / 100) *
                            (new Ax.sql.Date(mDateFecbas).getTime() - new Ax.sql.Date(mDateFecabo).getTime())) / 365 //Marc
                    ).setScale(mRowAfter.redondeo, Ax.math.bc.RoundingMode.HALF_UP)

                    let mIntInteresProv = Ax.math.bc.of(
                        ((mRowAfter.totnom) *
                            (mRowAfter.tipint / 100) *
                            (new Ax.sql.Date(pDateFecha).getTime() - new Ax.sql.Date(mDateFecbas).getTime())) / 365  //Marc
                    ).setScale(mRowAfter.redondeo, Ax.math.bc.RoundingMode.HALF_UP)

                    /**==================================== *
                     *   Actualiza el registro de cartera   *
                     * ==================================== */
                    if (mIntInteresVenc == 0) mDateFecbas = null // Limpia la fecha de calculo en caso de que no hayan intereses vencidos.
                    Ax.db.insert('cval_carvalh',
                        {
                            histid: 0,
                            cartid: mRowAfter.operid,
                            operid: null,
                            procid: mRowAfter.Procid,
                            empcode: mRowAfter.empcode,
                            codcar: mRowAfter.codcar,
                            codval: mRowAfter.codval,
                            feccom: mRowAfter.feccom,
                            numtit: mRowAfter.numtit,
                            moneda: mRowAfter.moneda,
                            precio: mRowAfter.precio,
                            totdiv: mRowAfter.totdiv,
                            totloc: mRowAfter.totloc,
                            totnom: mRowAfter.totnom,
                            totact: mRowAfter.totact,
                            imptot: mRowAfter.imptot,
                            fecemi: mRowAfter.fecemi,
                            fecini: mRowAfter.fecini,
                            fecfin: mRowAfter.fecfin,
                            tipint: mRowAfter.tipint,
                            tippag: mRowAfter.tippag,
                            fecabo: mRowAfter.fecabo,
                            impabo: mRowAfter.impabo,
                            fecpro: mRowAfter.fecpro,
                            imppro: mRowAfter.imppro,
                            fecint: mRowAfter.fecint,
                            impint: mRowAfter.impint,
                            fecven: mRowAfter.fecven,
                            impven: mRowAfter.impven
                        }
                    )

                    Ax.db.update('cval_carvalo',
                        {
                            impven: mIntInteresVenc,
                            impint: mIntInteresProv,
                            fecven: mDateFecbas,
                            fecint: pDateFecha,
                            estado: 'C',
                            user_updated: CURRENT_USER,
                            date_updated: CURRENT_DATE
                        },
                        {
                            operid: mRowAfter.operid
                        }
                    )

                }

            }
        })

        .forEach(mRowForEach => {
            /**============================================== *
             *   Cargamos datos para los apuntes contables    * 
             * ============================================== */
            let mRowCapuntes = {
                "id_apunte": 0,
                "id_asiento": mRowForEach.id_asiento,
                "orden": 0,                   // Correlativo de apuntes 
                "docser": mRowForEach.docser,
                "moneda": mRowForEach.moneda,
                "cambio": mRowForEach.cambio,
                "camope": mRowForEach.camope,
                "empcode": mRowForEach.empcode,
                "proyec": mRowForEach.seccio,
                "seccio": mRowForEach.proyec,
                "placon": mRowForEach.placon,
                "cuenta": null,                //Cuenta de operacion
                "debe": 0,
                "haber": 0,
                "divdeb": 0,
                "divhab": 0,
                "punteo": 'N',                 //No auditado
                "user_created": CURRENT_USER,
                "date_created": CURRENT_DATE,
                "user_updated": CURRENT_USER,
                "date_updated": CURRENT_DATE
            }

            /**============================================ *
             *   Insertamos las lineas de debe del apunte   *
             * ============================================ */
            if (mRowForEach.impabo > 0) {
                mRowCapuntes.cuenta = mRowForEach.ctainv;
                mRowCapuntes.debe = mRowForEach.impabo;
                mRowCapuntes.divdeb = Ax.db.executeGet(`SELECT icon_get_impdiv(0, '${mRowCapuntes.empcode}',
                                                                                  '${mRowCapuntes.moneda}',
                                                                                  ${pDateFecha},
                                                                                  '${mRowCapuntes.cambio}',
                                                                                  ${mRowForEach.debe}) impdiv`);
                Ax.db.insert('capuntes', mRowCapuntes).getSerial();
            }

            /**============================================ *
             *   Insertamos las lineas de haber del apunte  *
             * ============================================ */
            if (mRowForEach.impint > 0) {
                mRowCapuntes.cuenta = mRowForEach.ctaper;
                mRowCapuntes.haber = mRowForEach.impint;
                mRowCapuntes.divhab = Ax.db.executeGet(`SELECT icon_get_impdiv(0, '${mRowCapuntes.empcode}',
                                                                                  '${mRowCapuntes.moneda}',
                                                                                  ${pDateFecha},
                                                                                  '${mRowCapuntes.cambio}',
                                                                                  ${mRowForEach.haber}) impdiv`);
                Ax.db.insert('capuntes', mRowCapuntes).getSerial();
            }
        })

}