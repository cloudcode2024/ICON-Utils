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
function cval_carvalo_inter(pStrCodcar, pStrCodcal, pDateFecha) {
    /**================================= *
     *   Datos por defecto del usuario   *
     * ================================= */
    let mRowCconInterface = {};
    const mRowUserDefaults = Ax.db
        .executeProcedure(
            "cdefcont_defaults",
            Ax.ext.user.getCode(),
            "cval_opercar"
        )
        .toOne();

    if (!mRowUserDefaults.diario)
        throw "cval_carvalo_inter: [cdefcont.diario] NO INFORMADO!.";

    /**================================================================ *
     *   Verificamos operaciones anteriores pendientes de contabilizar  *
     * ================================================================ */
    if (
        Ax.db.executeGet(`
              <select>
                  <columns>
                      COUNT(*) count
                  </columns>
                  <from table='cval_opercar'/>
                  <where>
                          cval_opercar.codcar LIKE '%${pStrCodcar}%'
                      AND cval_opercar.codval LIKE '%${pStrCodcal}%'
                      AND cval_opercar.fecope <= '${pDateFecha}'
                      AND cval_opercar.estado != 'C'
                  </where>
              </select>
          `) > 0
    )
        throw "cval_carvalo_inter: OPERACIONES CON FECHA ANTERIOR PENDIENTES DE CONTABILIZAR.";

    /**=========================================================================== *
     *   Generamos registro del proceso y vinculamos los apuntes a este registro   *
     * =========================================================================== */
    mRowCconInterface.loteid = Ax.db.insert("cenllote", {
        loteid: 0,
        procname: "cval_carvalo_inter",
        tabname: "cval_prohist",
        colname: "procid",
        modcon: 2,
    });

    const mIntProcid = Ax.db.insert("cval_prohist", {
        procid: 0,
        apteid: mRowCconInterface.loteid,
        codcar: pStrCodcar,
        codval: pStrCodcal,
        fecpro: pDateFecha,
        tippro: "F",
    });

    Ax.db.insert("cenlsubs", {
        procid: mIntProcid,
        loteid: mRowCconInterface.loteid,
    });

    const mRsCvalCarvalo = Ax.db.executeQuery(`
          <select oracle='ansi'>
              <columns>
                  cval_carvalo.operid, cval_carvalo.empcode, cval_carvalo.codcar, cval_carvalo.codval,
                  cval_carvalo.feccom, cval_carvalo.numtit, cval_carvalo.moneda, cval_carvalo.precio,
                  cval_carvalo.totdiv, cval_carvalo.totloc, cval_carvalo.totnom, cval_carvalo.totact,
                  cval_carvalo.imptot, cval_carvalo.fecemi, cval_carvalo.fecini, cval_carvalo.fecfin,
                  cval_carvalo.tipint, cval_carvalo.tippag, cval_carvalo.fecabo, cval_carvalo.impabo,
                  cval_carvalo.fecpro, cval_carvalo.imppro, cval_carvalo.fecint, cval_carvalo.impint,
                  cval_carvalo.fecven, cval_carvalo.impven,
                  cval_tipcart.nomcar, cval_tipcart.empcode, cval_tipcart.proyec, cval_tipcart.seccio,
                  cval_tipcart.sistem, cval_tipcart.codagr,  cval_agrcart.cosmed,
                  cval_carvalc.numtit  carvalc_numtit,       cval_carvalc.impmed, cval_carvalc.impcos,
                  cval_valores.nomval, cval_valores.tipren,  cval_valores.codcon,
                  icon_get_ctanem(cval_carvalo.empcode,cval_valores.ctainv) valores_ctainv,
                  icon_get_ctanem(cval_carvalo.empcode,cval_valctas.ctaire) ctaire,
                  icon_get_ctanem(cval_carvalo.empcode,cval_valctas.ctainv) ctainv,
                  icon_get_ctanem(cval_carvalo.empcode,cval_valctas.ctaben) ctaben,
                  icon_get_ctanem(cval_carvalo.empcode,cval_valctas.ctaper) ctaper,
                  icon_get_ctanem(cval_carvalo.empcode,cval_valctas.ctaprd) ctaprd,
                  icon_get_ctanem(cval_carvalo.empcode,cval_valctas.ctapri) ctapri,
                  icon_get_ctanem(cval_carvalo.empcode,cval_valctas.ctadpc) ctadpc,
                  icon_get_ctanem(cval_carvalo.empcode,cval_valctas.ctadnc) ctadnc,
                  icon_get_ctanem(cval_carvalo.empcode,cval_valctas.ctaret) ctaret,
                  icon_get_ctanem(cval_carvalo.empcode,cval_valctas.ctagas) ctagas
              </columns>
              <from table='cval_carvalo'>
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
                  </join>
  
                  <join table='cval_carvalo' alias='cval_carvalo_c'>
                      <on>cval_carvalo_c.operid = cval_carvalo.operid</on>
                  </join>
                  <join table='cval_carvalo' alias='cval_carvalo_b'>
                      <on>cval_carvalo_b.codval = cval_carvalc.codval</on>
                      <on>cval_carvalo_b.operid = cval_carvalo_c.operid</on>
                  </join> 
              </from>
              <where>
                      cval_carvalo.codcar LIKE '%${pStrCodcar}%'
                  AND cval_carvalo.codval LIKE '%${pStrCodcal}%'
                  AND cval_carvalo.feccom  <= '${pDateFecha}'
                  AND (cval_carvalo.fecabo <= '${pDateFecha}' OR cval_carvalo.fecabo IS NULL)
                  AND cval_valores.tipren = 'F'
                  AND cval_carvalo.numtit > 0
              </where>
              <order>fecpro, operid</order>
          </select>
      `);

    for (let mRowCarvalo of mRsCvalCarvalo) {
        let mRowCvalTipcart = {
            nomcar: mRowCarvalo.nomcar,
            empcode: mRowCarvalo.empcode,
            proyec: mRowCarvalo.proyec,
            seccio: mRowCarvalo.seccio,
            sistem: mRowCarvalo.sistem,
            codagr: mRowCarvalo.codagr,
        };

        let mRowCvalores = {
            nomval: mRowCarvalo.nomval,
            tipren: mRowCarvalo.tipren,
            ctainv: mRowCarvalo.valores_ctainv,
        };

        /**================================================================ *
         *   Obtenemos la cuenta auxiliar de la empresa del valor-cartera   *
         * ================================================================ */
        const mRowCempresaCtaux = Ax.executeGet(
            `
              <select >
                  <columns>
                      cempresa.ctaaux
                  </columns>
                  <from table='cempresa'/>
                  <where>
                      cempresa.empcode = ?
                  </where>
              </select>
          `,
            mRowCvalTipcart.empcode
        );

        /**==================================================== *
         *   Obtenemos el redondeo moneda local de la empresa   *
         * ==================================================== */
        const mIntRedondeo = Ax.db.executeGet(`
              <select first='1'>
                  <columns>
                      icon_get_divred(icon_get_moneda('${mRowCvalTipcart.empcode}'))
                  </columns>
              </select>
          `);

        /**========================================================================= *
         *   Consideramos las cuentas contables particulares para el valor-cartera   *
         * ========================================================================= */
        const mRowCvalVlactas = Ax.db
            .executeQuery(
                `
              <select >
                  <columns>
                      icon_get_ctanem('${mRowCarvalo.empcode}',cval_valctas.ctaire) ctaire,
                      icon_get_ctanem('${mRowCarvalo.empcode}',cval_valctas.ctainv) ctainv,
                      icon_get_ctanem('${mRowCarvalo.empcode}',cval_valctas.ctaben) ctaben,
                      icon_get_ctanem('${mRowCarvalo.empcode}',cval_valctas.ctaper) ctaper,
                      icon_get_ctanem('${mRowCarvalo.empcode}',cval_valctas.ctaprd) ctaprd,
                      icon_get_ctanem('${mRowCarvalo.empcode}',cval_valctas.ctapri) ctapri,
                      icon_get_ctanem('${mRowCarvalo.empcode}',cval_valctas.ctadpc) ctadpc,
                      icon_get_ctanem('${mRowCarvalo.empcode}',cval_valctas.ctadnc) ctadnc,
                      icon_get_ctanem('${mRowCarvalo.empcode}',cval_valctas.ctaret) ctaret,
                      icon_get_ctanem('${mRowCarvalo.empcode}',cval_valctas.ctagas) ctagas
                  </columns>
                  <from table='cval_valctas'>
                      <join table='cval_valcont'>
                          <on>cval_valctas.codcon = cval_valcont.codcon</on>
                      </join>
                  </from>
                  <where>
                          cval_valcont.codcar = '${mRowCarvalo.codval}'
                      AND cval_valcont.codval = '${mRowCarvalo.codval}'
                  </where>
              </select> 
          `
            )
            .toOne();

        mRowCarvalo.ctaire = mRowCvalVlactas.ctaire ?? mRowCarvalo.ctaire;
        mRowCarvalo.ctainv = mRowCvalVlactas.ctainv ?? mRowCarvalo.ctainv;
        mRowCarvalo.ctaben = mRowCvalVlactas.ctaben ?? mRowCarvalo.ctaben;
        mRowCarvalo.ctaper = mRowCvalVlactas.ctaper ?? mRowCarvalo.ctaper;
        mRowCarvalo.ctaprd = mRowCvalVlactas.ctaprd ?? mRowCarvalo.ctaprd;
        mRowCarvalo.ctapri = mRowCvalVlactas.ctapri ?? mRowCarvalo.ctapri;
        mRowCarvalo.ctadpc = mRowCvalVlactas.ctadpc ?? mRowCarvalo.ctadpc;
        mRowCarvalo.ctadnc = mRowCvalVlactas.ctadnc ?? mRowCarvalo.ctadnc;
        mRowCarvalo.ctaret = mRowCvalVlactas.ctaret ?? mRowCarvalo.ctaret;
        mRowCarvalo.ctagas = mRowCvalVlactas.ctagas ?? mRowCarvalo.ctagas;
        mRowCvalores.ctainv = mRowCvalVlactas.ctainv ?? mRowCarvalo.ctainv;

        /**=================================================== *
         *   Cargamos datos comunes de todas las operaciones   *
         * =================================================== */
        const mStrJusser = Ax.db.executeGet(
            `SELECT FIRST 1 icon_nxt_jusemp('EF', '${mRowCvalTipcart.empcode}', '${mRowUserDefaults.jusser}', '${pDateFecha}', 'N')`
        );

        mRowCconInterface = {
            numlot: mIntProcid,
            doclot: "V",
            tipcla: "cval_prohist",
            codigo: "cval_carvalo_int",
            numsec: 10,
            fecha: pDateFecha,
            empcode: mRowCvalTipcart.empcode,
            proyec: mRowCvalTipcart.proyec,
            seccio: mRowCvalTipcart.seccio,
            jusser: mStrJusser,
            docser: mStrJusser,
            moneda: Ax.db.executeGet(
                `SELECT FIRST 1 icon_get_moneda('${mRowCvalTipcart.empcode}}')`
            ),
            cambio: 1,
            tabori: "cval_prohist",
            tabid: mIntProcid,
            field01: mRowUserDefaults.diario, // Diario
            field02: mRowUserDefaults.codcon, // cdefcont.codcon
            field03: mRowCvalTipcart.sistem, // Sistema
            field04: mRowCempresaCtaux, // Cuenta Auxiliar
            field05: mRowCarvalo.codval, // Código Valor
            field06: mRowCvalores.nomval, // Descripcion Valor
            field07: mRowCarvalo.codcar, // Código Cartera
            field08: mRowCvalTipcart.nomcar, // Descripcion Cartera
            field09: mRowCarvalo.moneda, // Moneda de la cartera
            field10: mRowCvalores.ctainv, // Subcuenta inversion
            field11: mRowCarvalo.ctaprd, // Subcuenta provisiones
            field12: mRowCarvalo.ctaper, // Subcuenta Perdida provisiones
            field13: mRowCarvalo.ctaire, // Subcuenta inversion regularizacion
            field14: mRowCarvalo.ctaben, // Subcuenta Beneficio o perdida
            field15: mRowCarvalo.ctapri, // Subcuenta Intereses
        };

        /**====================================================================== *
         *   Deshace la provision anterior de intereses                           *
         *   Deshace la provision de intereses e intereses vencidos no cobrados   *
         * ====================================================================== */
        if (mRowCarvalo.impven != 0 || mRowCarvalo.impint != 0) {
            mRowCconInterface.impor07 = mRowCarvalo.impven;
            mRowCconInterface.impor08 = mRowCarvalo.impint;
            mRowCconInterface.impor09 = mRowCarvalo.impven + mRowCarvalo.impint;

            Ax.db.insert("cval_carhist", {
                apteid: mRowCconInterface.loteid,
                procid: mIntProcid,
                codcar: mRowCarvalo.codcar,
                codval: mRowCarvalo.codval,
                fecope: pDateFecha,
                tipope: "V",
                imptot: -mRowCarvalo.impven,
            });

            Ax.db.insert("cval_carhist", {
                apteid: mRowCconInterface.loteid,
                procid: mIntProcid,
                codcar: mRowCarvalo.codcar,
                codval: mRowCarvalo.codval,
                fecope: pDateFecha,
                tipope: "P",
                imptot: -mRowCarvalo.impven,
            });
        } else {
            mRowCconInterface.impor07 = 0;
            mRowCconInterface.impor08 = 0;
            mRowCconInterface.impor09 = 0;
        }

        let mDateFecabo = mRowCarvalo.fecabo ?? mRowCarvalo.fecini;
        let mDateFecUltCob = mDateFecabo;

        if (mDateFecUltCob == null)
            throw "cval_carvalo_inter: FECHA DEVENGO INTERESES NO INFORMADA.";
        if (
            new Ax.sql.Date(mDateFecUltCob).getTime() >
            new Ax.sql.Date(pDateFecha).getTime()
        )
            continue;

        /**============================================================== *
         *   Ahora que podemos poner descripciones a los valores de los   *
         *   campos, podriamos convertir p_tippag en smallint y que       *
         *   contenga directamente el numero de meses                     *
         * ============================================================== */
        let mIntPeriod = 1;
        switch (mRowCarvalo.tippag) {
            case "A":
                mIntPeriod = 12;
                break;
            case "S":
                mIntPeriod = 6;
                break;
            case "T":
                mIntPeriod = 3;
                break;
            default:
                mIntPeriod = 1;
        }

        let mIntYear = new Ax.sql.Date(mDateFecUltCob).getYear();
        let mIntMonth = new Ax.sql.Date(mDateFecUltCob).getMonth() + 1;
        let mDateFecbas = mDateFecUltCob;
        let mIntDay = 0;

        for (let index = 1; index <= 20; index++) {
            mIntMonth += mIntPeriod;

            if (mIntMonth > 12) {
                mIntMonth -= 12;
                mIntYear += 1;
            }

            mIntMonth =
                mIntMonth == 2 && new Ax.sql.Date(mDateFecbas).getDate() > 28
                    ? 28
                    : (mIntMonth == 4 ||
                        mIntMonth == 6 ||
                        mIntMonth == 9 ||
                        mIntMonth == 11) &&
                        new Ax.sql.Date(mDateFecUltCob).getDate() > 30
                        ? 30
                        : new Ax.sql.Date(mDateFecUltCob).getDate();

            if (
                new Ax.sql.Date(mIntMonth, mIntDay, mIntYear).getTime() >
                new Ax.sql.Date(pDateFecha).getTime()
            )
                break;

            mDateFecbas = new Ax.sql.Date(mIntMonth, mIntDay, mIntYear);
        }

        if (
            new Ax.sql.Date(mDateFecbas).getTime() >
            new Ax.sql.Date(mRowCarvalo.fecini).getTime()
        )
            continue;

        let mIntInteresVenc = Ax.math.bc
            .of(
                (mRowCarvalo.totnom *
                    (mRowCarvalo.tipint / 100) *
                    (mDateFecbas - mDateFecabo)) /
                365
            )
            .setScale(mIntRedondeo, Ax.math.bc.RoundingMode.HALF_UP);

        let mIntInteresProv = Ax.math.bc
            .of(
                (mRowCarvalo.totnom *
                    (mRowCarvalo.tipint / 100) *
                    (pDateFecha - mDateFecbas)) /
                365
            )
            .setScale(mIntRedondeo, Ax.math.bc.RoundingMode.HALF_UP);

        mRowCconInterface.impor01 = mRowCarvalo.numtit;
        mRowCconInterface.impor02 = mIntInteresVenc;
        mRowCconInterface.impor03 = mIntInteresProv;
        mRowCconInterface.impor04 = mIntInteresProv + mIntInteresVenc;
        mRowCconInterface.impor05 = mDateFecbas - mDateFecabo;
        mRowCconInterface.impor06 = pDateFecha - mDateFecbas;
        mRowCconInterface.fecha01 = mDateFecabo;
        mRowCconInterface.fecha02 = mDateFecbas;
        mRowCconInterface.fecha03 = pDateFecha;

        Ax.db.insert("ccon_interfase", mRowCconInterface);

        if (mIntInteresVenc != 0) {
            Ax.db.insert("cval_carhist", {
                apteid: mRowCconInterface.loteid,
                procid: mIntProcid,
                codcar: mRowCarvalo.codcar,
                codval: mRowCarvalo.codval,
                fecope: pDateFecha,
                tipope: "V",
                imptot: mIntInteresVenc,
            });
        }

        if (mIntInteresProv != 0) {
            Ax.db.insert("cval_carhist", {
                apteid: mRowCconInterface.loteid,
                procid: mIntProcid,
                codcar: mRowCarvalo.codcar,
                codval: mRowCarvalo.codval,
                fecope: pDateFecha,
                tipope: "P",
                imptot: mIntInteresProv,
            });
        }

        /**==================================== *
         *   Actualiza el registro de cartera   *
         * ==================================== */
        if (mIntInteresVenc == 0) mDateFecbas = null; // Limpia la fecha de calculo en caso de que no hayan intereses vencidos.

        Ax.db.insert("cval_carvalh", {
            histid: 0,
            cartid: mRowCarvalo.operid,
            operid: null,
            procid: mIntProcid,
            empcode: mRowCvalTipcart.empcode,
            codcar: mRowCarvalo.codcar,
            codval: mRowCarvalo.codval,
            feccom: mRowCarvalo.feccom,
            numtit: mRowCarvalo.numtit,
            moneda: mRowCarvalo.moneda,
            precio: mRowCarvalo.precio,
            totdiv: mRowCarvalo.totdiv,
            totloc: mRowCarvalo.totloc,
            totnom: mRowCarvalo.totnom,
            totact: mRowCarvalo.totact,
            imptot: mRowCarvalo.imptot,
            fecemi: mRowCarvalo.fecemi,
            fecini: mRowCarvalo.fecini,
            fecfin: mRowCarvalo.fecfin,
            tipint: mRowCarvalo.tipint,
            tippag: mRowCarvalo.tippag,
            fecabo: mRowCarvalo.fecabo,
            impabo: mRowCarvalo.impabo,
            fecpro: mRowCarvalo.fecpro,
            imppro: mRowCarvalo.imppro,
            fecint: mRowCarvalo.fecint,
            impint: mRowCarvalo.impint,
            fecven: mRowCarvalo.fecven,
            impven: mRowCarvalo.impven,
        });

        Ax.db.update(
            "cval_carvalo",
            {
                impven: mIntInteresVenc,
                impint: mIntInteresProv,
                fecven: mDateFecbas,
                fecint: pDateFecha,
                user_updated: new Ax.sql.Date(),
                date_updated: Ax.ext.user.getCode(),
            },
            {
                operid: mRowCarvalo.operid,
            }
        );
    }

    if (mRowUserDefaults.conint == 1)
        Ax.db.call(
            "ccon_interfase_contab",
            0, // Ejecucion modo online
            1, // Borrado de registros al finalizar
            mRowCconInterface.numlot,
            mRowCconInterface.doclot,
            mRowCconInterface.tipcla
        );
}