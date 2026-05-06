package com.finalphase.fabricapins.ecommerce.mapper;

import com.finalphase.fabricapins.ecommerce.domain.entities.Categoria;
import com.finalphase.fabricapins.ecommerce.domain.entities.Produto;
import com.finalphase.fabricapins.ecommerce.domain.entities.ProdutoVariacao;
import com.finalphase.fabricapins.ecommerce.dto.produto.ProdutoDTO;
import com.finalphase.fabricapins.ecommerce.dto.produto.ProdutoMinDTO;
import com.finalphase.fabricapins.ecommerce.dto.produto.ProdutoRequest;
import com.finalphase.fabricapins.ecommerce.dto.produto_variacao.ProdutoVariacaoMinDTO;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-02T20:24:02-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class ProdutoMapperImpl implements ProdutoMapper {

    @Autowired
    private ProdutoVariacaoMapper produtoVariacaoMapper;

    @Override
    public ProdutoDTO toDTO(Produto entity) {
        if ( entity == null ) {
            return null;
        }

        Long categoriaId = null;
        String categoriaNome = null;
        Long id = null;
        String nome = null;
        String descricao = null;
        String imgUrl = null;
        Double peso = null;
        Double altura = null;
        Double largura = null;
        Double comprimento = null;
        String slug = null;
        Instant dataCadastro = null;
        Instant dataAtualizacao = null;
        boolean destaque = false;
        boolean ativo = false;
        List<ProdutoVariacaoMinDTO> produtosVariacao = null;

        categoriaId = entityCategoriaId( entity );
        categoriaNome = entityCategoriaNome( entity );
        id = entity.getId();
        nome = entity.getNome();
        descricao = entity.getDescricao();
        imgUrl = entity.getImgUrl();
        peso = entity.getPeso();
        if ( entity.getAltura() != null ) {
            altura = entity.getAltura().doubleValue();
        }
        if ( entity.getLargura() != null ) {
            largura = entity.getLargura().doubleValue();
        }
        if ( entity.getComprimento() != null ) {
            comprimento = entity.getComprimento().doubleValue();
        }
        slug = entity.getSlug();
        dataCadastro = entity.getDataCadastro();
        dataAtualizacao = entity.getDataAtualizacao();
        destaque = entity.isDestaque();
        ativo = entity.isAtivo();
        produtosVariacao = produtoVariacaoListToProdutoVariacaoMinDTOList( entity.getProdutosVariacao() );

        ProdutoDTO produtoDTO = new ProdutoDTO( id, nome, descricao, imgUrl, peso, altura, largura, comprimento, slug, dataCadastro, dataAtualizacao, destaque, ativo, categoriaId, categoriaNome, produtosVariacao );

        return produtoDTO;
    }

    @Override
    public ProdutoMinDTO toMinDTO(Produto entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        String nome = null;
        String imgUrl = null;
        String slug = null;
        boolean destaque = false;

        id = entity.getId();
        nome = entity.getNome();
        imgUrl = entity.getImgUrl();
        slug = entity.getSlug();
        destaque = entity.isDestaque();

        ProdutoMinDTO produtoMinDTO = new ProdutoMinDTO( id, nome, imgUrl, slug, destaque );

        return produtoMinDTO;
    }

    @Override
    public Produto toEntity(ProdutoRequest dto) {
        if ( dto == null ) {
            return null;
        }

        String nome = null;
        String descricao = null;
        String imgUrl = null;
        boolean destaque = false;

        nome = dto.nome();
        descricao = dto.descricao();
        imgUrl = dto.imgUrl();
        destaque = dto.destaque();

        String slug = null;

        Produto produto = new Produto( nome, descricao, imgUrl, slug, destaque );

        produto.setPeso( dto.peso() );
        if ( dto.altura() != null ) {
            produto.setAltura( dto.altura().intValue() );
        }
        if ( dto.largura() != null ) {
            produto.setLargura( dto.largura().intValue() );
        }
        if ( dto.comprimento() != null ) {
            produto.setComprimento( dto.comprimento().intValue() );
        }

        return produto;
    }

    @Override
    public void updateFromDto(ProdutoRequest dto, Produto entity) {
        if ( dto == null ) {
            return;
        }

        entity.setNome( dto.nome() );
        entity.setDescricao( dto.descricao() );
        entity.setImgUrl( dto.imgUrl() );
        entity.setPeso( dto.peso() );
        if ( dto.altura() != null ) {
            entity.setAltura( dto.altura().intValue() );
        }
        else {
            entity.setAltura( null );
        }
        if ( dto.largura() != null ) {
            entity.setLargura( dto.largura().intValue() );
        }
        else {
            entity.setLargura( null );
        }
        if ( dto.comprimento() != null ) {
            entity.setComprimento( dto.comprimento().intValue() );
        }
        else {
            entity.setComprimento( null );
        }
        entity.setDestaque( dto.destaque() );
    }

    @Override
    public void partialUpdateFromDto(ProdutoRequest dto, Produto entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.nome() != null ) {
            entity.setNome( dto.nome() );
        }
        if ( dto.descricao() != null ) {
            entity.setDescricao( dto.descricao() );
        }
        if ( dto.imgUrl() != null ) {
            entity.setImgUrl( dto.imgUrl() );
        }
        if ( dto.peso() != null ) {
            entity.setPeso( dto.peso() );
        }
        if ( dto.altura() != null ) {
            entity.setAltura( dto.altura().intValue() );
        }
        if ( dto.largura() != null ) {
            entity.setLargura( dto.largura().intValue() );
        }
        if ( dto.comprimento() != null ) {
            entity.setComprimento( dto.comprimento().intValue() );
        }
        entity.setDestaque( dto.destaque() );
    }

    private Long entityCategoriaId(Produto produto) {
        if ( produto == null ) {
            return null;
        }
        Categoria categoria = produto.getCategoria();
        if ( categoria == null ) {
            return null;
        }
        Long id = categoria.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String entityCategoriaNome(Produto produto) {
        if ( produto == null ) {
            return null;
        }
        Categoria categoria = produto.getCategoria();
        if ( categoria == null ) {
            return null;
        }
        String nome = categoria.getNome();
        if ( nome == null ) {
            return null;
        }
        return nome;
    }

    protected List<ProdutoVariacaoMinDTO> produtoVariacaoListToProdutoVariacaoMinDTOList(List<ProdutoVariacao> list) {
        if ( list == null ) {
            return null;
        }

        List<ProdutoVariacaoMinDTO> list1 = new ArrayList<ProdutoVariacaoMinDTO>( list.size() );
        for ( ProdutoVariacao produtoVariacao : list ) {
            list1.add( produtoVariacaoMapper.toMinDTO( produtoVariacao ) );
        }

        return list1;
    }
}
