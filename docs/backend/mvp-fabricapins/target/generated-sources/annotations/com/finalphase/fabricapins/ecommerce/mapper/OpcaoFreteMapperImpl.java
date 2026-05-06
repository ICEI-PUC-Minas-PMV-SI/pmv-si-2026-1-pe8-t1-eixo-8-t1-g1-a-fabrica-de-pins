package com.finalphase.fabricapins.ecommerce.mapper;

import com.finalphase.fabricapins.ecommerce.domain.entities.OpcaoFretePedido;
import com.finalphase.fabricapins.ecommerce.dto.frete.OpcaoFreteDTO;
import com.finalphase.fabricapins.ecommerce.integration.frete.dto.MelhorEnvioCompany;
import com.finalphase.fabricapins.ecommerce.integration.frete.dto.MelhorEnvioResponse;
import java.math.BigDecimal;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-02T20:24:03-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class OpcaoFreteMapperImpl implements OpcaoFreteMapper {

    @Override
    public OpcaoFreteDTO toDTO(OpcaoFretePedido entity) {
        if ( entity == null ) {
            return null;
        }

        String serviceId = null;
        String nome = null;
        BigDecimal valor = null;
        Integer prazoDias = null;
        String empresa = null;

        serviceId = entity.getServiceId();
        nome = entity.getNome();
        valor = entity.getValor();
        prazoDias = entity.getPrazoDias();
        empresa = entity.getEmpresa();

        OpcaoFreteDTO opcaoFreteDTO = new OpcaoFreteDTO( serviceId, nome, valor, prazoDias, empresa );

        return opcaoFreteDTO;
    }

    @Override
    public OpcaoFretePedido toEntityFromMelhorEnvioResponse(MelhorEnvioResponse dto) {
        if ( dto == null ) {
            return null;
        }

        OpcaoFretePedido opcaoFretePedido = new OpcaoFretePedido();

        if ( dto.id() != null ) {
            opcaoFretePedido.setServiceId( String.valueOf( dto.id() ) );
        }
        opcaoFretePedido.setNome( dto.name() );
        opcaoFretePedido.setValor( OpcaoFreteMapper.stringToBigDecimal( dto.custom_price() ) );
        opcaoFretePedido.setPrazoDias( dto.custom_delivery_time() );
        opcaoFretePedido.setEmpresa( dtoCompanyName( dto ) );

        opcaoFretePedido.setProvider( "MELHOR_ENVIO" );

        return opcaoFretePedido;
    }

    @Override
    public OpcaoFretePedido toEntity(OpcaoFreteDTO dto) {
        if ( dto == null ) {
            return null;
        }

        OpcaoFretePedido opcaoFretePedido = new OpcaoFretePedido();

        opcaoFretePedido.setServiceId( dto.serviceId() );
        opcaoFretePedido.setNome( dto.nome() );
        opcaoFretePedido.setValor( dto.valor() );
        opcaoFretePedido.setPrazoDias( dto.prazoDias() );

        return opcaoFretePedido;
    }

    private String dtoCompanyName(MelhorEnvioResponse melhorEnvioResponse) {
        if ( melhorEnvioResponse == null ) {
            return null;
        }
        MelhorEnvioCompany company = melhorEnvioResponse.company();
        if ( company == null ) {
            return null;
        }
        String name = company.name();
        if ( name == null ) {
            return null;
        }
        return name;
    }
}
