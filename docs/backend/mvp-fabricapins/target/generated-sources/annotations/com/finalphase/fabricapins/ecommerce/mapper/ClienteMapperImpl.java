package com.finalphase.fabricapins.ecommerce.mapper;

import com.finalphase.fabricapins.ecommerce.domain.entities.Cliente;
import com.finalphase.fabricapins.ecommerce.domain.enums.TipoCliente;
import com.finalphase.fabricapins.ecommerce.domain.enums.TipoPessoa;
import com.finalphase.fabricapins.ecommerce.dto.cliente.ClienteMinDTO;
import com.finalphase.fabricapins.ecommerce.dto.cliente.ClienteMinPedidoDTO;
import com.finalphase.fabricapins.ecommerce.dto.cliente.ClienteRequest;
import java.time.Instant;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-02T20:24:03-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class ClienteMapperImpl implements ClienteMapper {

    @Override
    public ClienteMinDTO toDTO(Cliente entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        String nome = null;
        String email = null;
        String telefone = null;
        TipoPessoa tipoPessoa = null;
        String numeroDocumento = null;
        TipoCliente tipoCliente = null;
        Instant dataCadastro = null;
        Instant dataAtualizacao = null;
        boolean ativo = false;

        id = entity.getId();
        nome = entity.getNome();
        email = entity.getEmail();
        telefone = entity.getTelefone();
        tipoPessoa = entity.getTipoPessoa();
        numeroDocumento = entity.getNumeroDocumento();
        tipoCliente = entity.getTipoCliente();
        dataCadastro = entity.getDataCadastro();
        dataAtualizacao = entity.getDataAtualizacao();
        ativo = entity.isAtivo();

        ClienteMinDTO clienteMinDTO = new ClienteMinDTO( id, nome, email, telefone, tipoPessoa, numeroDocumento, tipoCliente, dataCadastro, dataAtualizacao, ativo );

        return clienteMinDTO;
    }

    @Override
    public ClienteMinPedidoDTO toClienteMinPedidoDTO(Cliente entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        String nome = null;
        String numeroDocumento = null;
        String telefone = null;
        TipoCliente tipoCliente = null;

        id = entity.getId();
        nome = entity.getNome();
        numeroDocumento = entity.getNumeroDocumento();
        telefone = entity.getTelefone();
        tipoCliente = entity.getTipoCliente();

        ClienteMinPedidoDTO clienteMinPedidoDTO = new ClienteMinPedidoDTO( id, nome, numeroDocumento, telefone, tipoCliente );

        return clienteMinPedidoDTO;
    }

    @Override
    public void updateFromDto(ClienteRequest dto, Cliente entity) {
        if ( dto == null ) {
            return;
        }

        entity.setNome( dto.nome() );
        entity.setEmail( dto.email() );
        entity.setTelefone( dto.telefone() );
        entity.setTipoPessoa( dto.tipoPessoa() );
        entity.setNumeroDocumento( dto.numeroDocumento() );
        entity.setTipoCliente( dto.tipoCliente() );
        entity.setAtivo( dto.ativo() );
    }

    @Override
    public void partialUpdateFromDto(ClienteRequest dto, Cliente entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.nome() != null ) {
            entity.setNome( dto.nome() );
        }
        if ( dto.email() != null ) {
            entity.setEmail( dto.email() );
        }
        if ( dto.telefone() != null ) {
            entity.setTelefone( dto.telefone() );
        }
        if ( dto.tipoPessoa() != null ) {
            entity.setTipoPessoa( dto.tipoPessoa() );
        }
        if ( dto.numeroDocumento() != null ) {
            entity.setNumeroDocumento( dto.numeroDocumento() );
        }
        if ( dto.tipoCliente() != null ) {
            entity.setTipoCliente( dto.tipoCliente() );
        }
        entity.setAtivo( dto.ativo() );
    }
}
