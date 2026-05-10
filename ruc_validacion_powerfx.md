# Validación de cédula y RUC Ecuador (Power Fx)

Este ejemplo ajusta la lógica para cubrir las reglas más comunes:

- **Cédula**: 10 dígitos, tercer dígito `< 6`, provincia `01..24`, módulo 10.
- **RUC Natural**: 13 dígitos, primeros 10 = cédula válida, sufijo `001..999` (no `000`).
- **RUC Privado/Jurídico (tercer dígito 9)**: módulo 11 con coeficientes `4,3,2,7,6,5,4,3,2`, verificador en posición 10, sufijo `001..999`.
- **RUC Público (tercer dígito 6)**: módulo 11 con coeficientes `3,2,7,6,5,4,3,2`, verificador en posición 9, sufijo `0001..9999`.
- Excepción módulo 11: si residuo = 0, verificador = 0.

## Fórmula sugerida

```powerfx
With(
    {
        id: Trim(TextInputPlannerTaskName_46.Text)
    };
    If(
        Len(id) = 0;
        Notify("Debe ingresar cédula o RUC"; NotificationType.Error);
        With(
            {
                esNumerico: IsNumeric(id);
                len: Len(id);
                prov: Value(Left(id; 2));
                tercer: Value(Mid(id; 3; 1));
                ult3: Right(id; 3);
                ult4: Right(id; 4)
            };
            With(
                {
                    provinciaValida: prov >= 1 && prov <= 24
                };
                With(
                    {
                        // ---------- CÉDULA (MÓDULO 10) ----------
                        coefCed: Table(
                            {pos: 1; c: 2}; {pos: 2; c: 1}; {pos: 3; c: 2};
                            {pos: 4; c: 1}; {pos: 5; c: 2}; {pos: 6; c: 1};
                            {pos: 7; c: 2}; {pos: 8; c: 1}; {pos: 9; c: 2}
                        );
                        sumaCed:
                            Sum(
                                Sequence(9) As s;
                                With(
                                    {
                                        producto: Value(Mid(id; s.Value; 1)) * LookUp(coefCed; pos = s.Value; c)
                                    };
                                    If(producto >= 10; producto - 9; producto)
                                )
                            )
                    };
                    With(
                        {
                            verCed:
                                If(
                                    Mod(sumaCed; 10) = 0;
                                    0;
                                    10 - Mod(sumaCed; 10)
                                );
                            cedulaValida:
                                len >= 10 &&
                                esNumerico &&
                                provinciaValida &&
                                tercer < 6 &&
                                Value(Mid(id; 10; 1)) =
                                    If(Mod(sumaCed; 10) = 0; 0; 10 - Mod(sumaCed; 10))
                        };
                        With(
                            {
                                // ---------- RUC PRIVADO (3er dígito = 9, MÓDULO 11) ----------
                                coefPriv: Table(
                                    {pos: 1; c: 4}; {pos: 2; c: 3}; {pos: 3; c: 2};
                                    {pos: 4; c: 7}; {pos: 5; c: 6}; {pos: 6; c: 5};
                                    {pos: 7; c: 4}; {pos: 8; c: 3}; {pos: 9; c: 2}
                                );
                                sumaPriv:
                                    Sum(
                                        Sequence(9) As s;
                                        Value(Mid(id; s.Value; 1)) * LookUp(coefPriv; pos = s.Value; c)
                                    );
                                residPriv: Mod(
                                    Sum(
                                        Sequence(9) As s;
                                        Value(Mid(id; s.Value; 1)) * LookUp(coefPriv; pos = s.Value; c)
                                    );
                                    11
                                );
                                verPriv:
                                    If(
                                        Mod(
                                            Sum(
                                                Sequence(9) As s;
                                                Value(Mid(id; s.Value; 1)) * LookUp(coefPriv; pos = s.Value; c)
                                            );
                                            11
                                        ) = 0;
                                        0;
                                        11 - Mod(
                                            Sum(
                                                Sequence(9) As s;
                                                Value(Mid(id; s.Value; 1)) * LookUp(coefPriv; pos = s.Value; c)
                                            );
                                            11
                                        )
                                    );

                                // ---------- RUC PÚBLICO (3er dígito = 6, MÓDULO 11) ----------
                                coefPub: Table(
                                    {pos: 1; c: 3}; {pos: 2; c: 2}; {pos: 3; c: 7}; {pos: 4; c: 6};
                                    {pos: 5; c: 5}; {pos: 6; c: 4}; {pos: 7; c: 3}; {pos: 8; c: 2}
                                );
                                sumaPub:
                                    Sum(
                                        Sequence(8) As s;
                                        Value(Mid(id; s.Value; 1)) * LookUp(coefPub; pos = s.Value; c)
                                    );
                                residPub: Mod(
                                    Sum(
                                        Sequence(8) As s;
                                        Value(Mid(id; s.Value; 1)) * LookUp(coefPub; pos = s.Value; c)
                                    );
                                    11
                                );
                                verPub:
                                    If(
                                        Mod(
                                            Sum(
                                                Sequence(8) As s;
                                                Value(Mid(id; s.Value; 1)) * LookUp(coefPub; pos = s.Value; c)
                                            );
                                            11
                                        ) = 0;
                                        0;
                                        11 - Mod(
                                            Sum(
                                                Sequence(8) As s;
                                                Value(Mid(id; s.Value; 1)) * LookUp(coefPub; pos = s.Value; c)
                                            );
                                            11
                                        )
                                    )
                            };
                            With(
                                {
                                    esCedula:
                                        len = 10 &&
                                        cedulaValida;

                                    esRucNatural:
                                        len = 13 &&
                                        cedulaValida &&
                                        tercer < 6 &&
                                        ult3 <> "000";

                                    esRucPrivado:
                                        len = 13 &&
                                        esNumerico &&
                                        provinciaValida &&
                                        tercer = 9 &&
                                        ult3 <> "000" &&
                                        verPriv <> 10 &&
                                        Value(Mid(id; 10; 1)) = verPriv;

                                    esRucPublico:
                                        len = 13 &&
                                        esNumerico &&
                                        provinciaValida &&
                                        tercer = 6 &&
                                        ult4 <> "0000" &&
                                        verPub <> 10 &&
                                        Value(Mid(id; 9; 1)) = verPub
                                };
                                If(
                                    esCedula || esRucNatural || esRucPrivado || esRucPublico;
                                    true;
                                    Notify("Cédula o RUC inválido"; NotificationType.Error);
                                    Reset(TextInputPlannerTaskName_46);
                                    false
                                )
                            )
                        )
                    )
                )
            )
        )
    )
)
```

## Nota rápida

Si quieres **solo RUC jurídico privado** (como tu fórmula original), conserva `tercer = 9` y validación del verificador en posición 10 con módulo 11. Si además necesitas instituciones públicas y RUC natural, usa la fórmula completa de arriba.

Si Power Apps no reconoce expresiones como `Value` dentro de `Sequence`, usa alias (`Sequence(n) As s`) y referencia `s.Value` como en este ejemplo.
Si tu entorno da error con `Index(...)`, usa tablas de coeficientes con columna `pos` y `LookUp(tabla; pos = s.Value; c)` (ya aplicado arriba).
