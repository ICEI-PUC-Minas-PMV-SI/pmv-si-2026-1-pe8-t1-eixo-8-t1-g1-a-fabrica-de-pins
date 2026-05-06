package com.finalphase.fabricapins.ecommerce.mapper;

import com.finalphase.fabricapins.ecommerce.domain.entities.PedidoCupom;
import com.finalphase.fabricapins.ecommerce.dto.PedidoCupom.PedidoCupomDTO;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-02T20:24:03-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class PedidoCupomMapperImpl implements PedidoCupomMapper {

    @Override
    public PedidoCupomDTO toDTO(PedidoCupom entity) {
        if ( entity == null ) {
            return null;
        }

        String codigo = null;
        BigDecimal valorDescontoAplicado = null;
        Instant dataAplicacao = null;

        codigo = entity.getCodigoCupom();
        valorDescontoAplicado = entity.getValorDescontoAplicado();
        dataAplicacao = entity.getDataAplicacao();

        PedidoCupomDTO pedidoCupomDTO = new PedidoCupomDTO( codigo, valorDescontoAplicado, dataAplicacao );

        return pedidoCupomDTO;
    }

    @Override
    public List<PedidoCupomDTO> toDTOSet(Set<PedidoCupom> entities) {
        if ( entities == null ) {
            return null;
        }

        List<PedidoCupomDTO> list = new ArrayList<PedidoCupomDTO>( entities.size() );
        for ( PedidoCupom pedidoCupom : entities ) {
            list.add( toDTO( pedidoCupom ) );
        }

        return list;
    }
}
