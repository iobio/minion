---
layout: post
title: Multi gene analysis
image: /public/images/blog/multiple-genes/main.png
subtitle: How do I analyze lists of genes, rather than a single gene?
tags:
  - Alistair Ward
  - gene.iobio
---
The <a href='http://gene.iobio.io' target="_blank">gene.iobio</a> version 2 blog series marches on with a discussion of multi-gene analysis. We think this is a major advancement and takes <a href='http://gene.iobio.io' target="_blank">gene.iobio</a> from a cool way of visualizing integrated data in a single gene, to a powerful method of performing analysis across sets of relevant genes. A following post in the series will look at generating gene lists based on phenotype using <a href='http://phenolyzer.usc.edu/' target='_blank'>Phenolyzer</a>, which really helps direct analysis.

To demonstrate functionality, we will look at the <a href='http://127.0.0.1:4000/?rel0=proband&rel1=mother&rel2=father&name0=&vcf0=https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz&bam0=https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12878.bam&name1=&vcf1=https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz&bam1=https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12892.bam&name2=&vcf2=https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz&bam2=https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12891.bam&sample0=NA12878&sample1=NA12891&sample2=NA12892&genes=RAI1&gene=RAI1' target='_blank'>RAI1</a> usecase. Here we see a familiar view of the Platinum trio data, which we can interrogate as we see fit. But what if we are interested in looking at variants in a different gene? We can add another gene, say AIRE, using the gene entry box at the top of the screen. Now we see both genes have a <i>badge</i> below the gene entry box, with a raft of glyphs in them, as shown below:

<img src="/public/images/blog/multiple-genes/gene-badges.png" style="width:75%; margin:20px 100px;">

So what does all this mean? Here are some details about these gene badges and how to use them:

<ul>
  <li>Clicking on a gene badge will take you to that gene,</li>
  <li>If any interesting variants are present in the gene, the glyphs indicate what. In the RAI1 gene, they indicate there is a least one variant (each glyph can be referring to a different variant) in the gene that is:</li>
    <ul>
      <li>a high impact variant, as predicted by VEP (<img src="/public/images/blog/multiple-genes/high-impact.png" style="width:2%; margin:-2px 0px;">),</li>
      <li>a pathogenic variant in ClinVar (<img src="/public/images/blog/multiple-genes/clinvar.png" style="width:2%; margin:0px 0px;">),</li>
      <li>a <i>de novo</i> variant (<img src="/public/images/blog/multiple-genes/denovo.png" style="width:2%; margin:-2px 0px;">),</li>
      <li>a recessive variant (<img src="/public/images/blog/multiple-genes/recessive.png" style="width:2%; margin:-2px 0px;">).</li>
    </ul>
  <li>If the checkmark (<img src="/public/images/blog/multiple-genes/checkmark.png" style="width:2%; margin:0px 0px;">) is present at the left of the gene badge, this indicates that the gene has been analyzed. The other glyphs will only be present if the gene has been analyzed, so this checkmark can differentiate between the case where the gene has been analyzed, but there are no interesting variants in the gene (<img src="/public/images/blog/multiple-genes/analyzed.png" style="width:10%; margin:-5px 0px;">), or that analysis on the gene has yet to be performed (<img src="/public/images/blog/multiple-genes/not_analyzed.png" style="width:8%; margin:-5px 0px;">), so we need to analyze the gene to determine if interesting variants are present.</li>
  <li>Hovering over the HPO gene-to-phenotype glyph (<img src="/public/images/blog/multiple-genes/gene-pheno-glyph.png" style="width:2%; margin:-2px 0px;">), when present, provides information on gene associated phenotypes. For example, these are the phenotypes associated with the RAI gene:</li>

  <div><img src="/public/images/blog/multiple-genes/gene-pheno.png" style="width:100%; margin:20px 0px;"></div>
</ul>

These gene badges make it simple to jump around a set of genes, analyzing data and identifying potentially interesting variants within them. An important question you might ask is how do we define a list of genes to look at? We can add each gene one by one, but we might want to look at a set of genes that we know are associated with a disease, or are the output of gene prioritization software. The next but one post will discuss using <a href='http://phenolyzer.usc.edu/' target='_blank'>Phenolyzer</a> to generate a gene list, but here we will touch on two simple methods.

## Import a gene list  
 
In the left panel, we can click the \'Genes\' button to bring up a menu that lets us define gene lists. The \'Import Gene set\' dropdown provides a space where we can manually import or paste a comma separated list of genes. Pressing \'Done\' will prompt <a href='http://gene.iobio.io' target="_blank">gene.iobio</a> to add all defined genes as badges in the top panel so we can start working with them.

<img src="/public/images/blog/multiple-genes/gene-import.png" style="width:75%; margin:20px 0px;">

## Analyze the ACMG56 genes  

<a href='https://www.acmg.net/' target='_blank'>The American College of Medical Genetics and Genomics (ACMG)</a> has defined a list of 56 genes that have been implicated predominantly in cancer and cardiovascular disease risk. It can be good practice to look for any known pathogenic variants in these genes, so you can add them by clicking the \'Import ACMG56 Genes\' button. By clicking this, all 56 genes will be added to the top panel and be ready for analysis. The next post in the series will give a brief discussion of ths feature.

## Analyze all genes  

Once a set of genes has been defined, the next step is usually to see if any of them harbour potentially interesting variants. Preferably, we would like to achieve this without having to click through every gene individiually. Luckily, we are not forced to do that! Instead, we can just click \'Analyze all\' to the left of the gene badges and each gene will be analyzed in turn; the gene being analyzed has a working symbol (<img src="/public/images/blog/multiple-genes/working.png" style="width:2%; margin:-2px 0px;">) to identify which gene is being processed. As each gene is analyzed the check mark (<img src="/public/images/blog/multiple-genes/checkmark.png" style="width:2%; margin:0px 0px;">) appears along with any glyphs describing contained variants. Once complete, the glyphs appearing in each gene badge direct us to where interesting variants lie (note that you can click on an analyzed gene to investigate, while <a href='http://gene.iobio.io' target="_blank">gene.iobio</a> continues to work through the rest of the genes).

As always, <a href="mailto:iobioproject@gmail.com" subject="gene.iobio suggestions">contact us</a> with any questions or comments, and stay tuned for the next two posts describing using the ACMG56 genes and the use of <a href='http://phenolyzer.usc.edu/' target='_blank'>Phenolyzer</a> to turn your phenotype into a prioritized gene list.
