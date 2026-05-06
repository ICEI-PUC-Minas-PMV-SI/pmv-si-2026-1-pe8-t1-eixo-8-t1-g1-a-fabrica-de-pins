package com.finalphase.fabricapins.ecommerce.mapper;

import com.finalphase.fabricapins.ecommerce.domain.entities.Categoria;
import com.finalphase.fabricapins.ecommerce.dto.categoria.CategoriaDTO;
import com.finalphase.fabricapins.ecommerce.dto.categoria.CategoriaRequest;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-02T20:24:03-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class CategoriaMapperImpl implements CategoriaMapper {

    @Override
    public CategoriaDTO toDTO(Categoria categoria) {
        if ( categoria == null ) {
            return null;
        }

        Long id = null;
        String nome = null;
        String descricao = null;
        boolean ativa = false;

        id = categoria.getId();
        nome = categoria.getNome();
        descricao = categoria.getDescricao();
        ativa = categoria.isAtiva();

        CategoriaDTO categoriaDTO = new CategoriaDTO( id, nome, descricao, ativa );

        return categoriaDTO;
    }

    @Override
    public Categoria toEntity(CategoriaRequest dto) {
        if ( dto == null ) {
            return null;
        }

        Categoria categoria = new Categoria();

        categoria.setNome( dto.nome() );
        categoria.setDescricao( dto.descricao() );
        categoria.setAtiva( dto.ativa() );

        return categoria;
    }

    @Override
    public void updateFromDto(CategoriaRequest dto, Categoria entity) {
        if ( dto == null ) {
            return;
        }

        entity.setNome( dto.nome() );
        entity.setDescricao( dto.descricao() );
        entity.setAtiva( dto.ativa() );
    }

    @Override
    public void partialUpdateFromDto(CategoriaRequest dto, Categoria entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.nome() != null ) {
            entity.setNome( dto.nome() );
        }
        if ( dto.descricao() != null ) {
            entity.setDescricao( dto.descricao() );
        }
        entity.setAtiva( dto.ativa() );
    }
}
