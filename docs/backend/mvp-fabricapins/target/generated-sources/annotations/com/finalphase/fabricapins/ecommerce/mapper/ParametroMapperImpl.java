package com.finalphase.fabricapins.ecommerce.mapper;

import com.finalphase.fabricapins.ecommerce.domain.entities.Parametro;
import com.finalphase.fabricapins.ecommerce.domain.enums.ParametroChave;
import com.finalphase.fabricapins.ecommerce.dto.parametro.ParametroDTO;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-02T20:24:03-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class ParametroMapperImpl implements ParametroMapper {

    @Override
    public ParametroDTO toDTO(Parametro entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        ParametroChave chave = null;
        String valor = null;

        id = entity.getId();
        chave = entity.getChave();
        valor = entity.getValor();

        ParametroDTO parametroDTO = new ParametroDTO( id, chave, valor );

        return parametroDTO;
    }
}
