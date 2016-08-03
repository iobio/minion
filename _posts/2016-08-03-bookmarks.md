---
layout: post
title: Using bookmarks
image: /public/images/blog/bookmarks/main.png
subtitle: What are bookmarks and why should I use them?
tags:
  - Alistair Ward
  - gene.iobio
---
##General use
The <a href='http://gene.iobio.io' target="_blank">gene.iobio</a> version 2 blog series marches on with a discussion of bookmarks. A future post in this series will talk about importing bookmarks from external tools, e.g. <a href='https://gemini.readthedocs.org/en/latest/' target='_blank'>Gemini</a>. In this post, I will demonstrate how to use bookmarks, beginning with the <a href='http://gene.iobio.io/?rel0=proband&rel1=mother&rel2=father&name0=&vcf0=https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz&bam0=https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12878.bam&name1=&vcf1=https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz&bam1=https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12892.bam&name2=&vcf2=https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz&bam2=https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12891.bam&sample0=NA12878&sample1=NA12891&sample2=NA12892&genes=RAI1&gene=RAI1' target='_blank'>RAI1</a> usecase. In this gene, we can see a variant that is associated with smith-magenis syndrome and is marked as pathogenic in ClinVar (this is the variant at the far left in the ranking table and marked with the <img src="/public/images/blog/multiple-genes/clinvar.png" style="width:2%; margin:0px 0px;"> symbol). If we click on the variant (either clicking the column in the ranking table, or clicking on the actual variant in the proband variants), details about the variant will appear in a mouseover and in the panel to the left of the screen as shown below:
<div><img src="/public/images/blog/bookmarks/bookmark-select.png" style="width:75%; margin:20px 100px;"></div>

We can \"bookmark\" this variant by clicking \"Bookmark\" in either the left panel, or in the tooltip. Once bookmarked, we are free to continue looking at other variants, or analyzing other genes, knowing that we can easily return to this variant if needed. To return to the variant, we will use the \"Bookmarks\" panel to the left of the screen. If we open the bookmarks panel, we see the following at the left of the screen:
<div><img src="/public/images/blog/bookmarks/bookmark-panel.png" style="width:60%; margin:20px 150px;"></div>

The glyphs associated with the variant are visible along with the gene, coordinate and alleles, so we can quickly identify the important attributes of the variant (see <a href="http://iobio.io/2016/03/28/multi-gene/" target="_blank">here</a> for an explanation of the glyphs) - in this case a \"high impact\", ClinVar pathogenic, recessive variant. Clicking on the variant will return us to the correct gene and highlight the variant. All bookmarked variants will have the <img src="/public/images/blog/bookmarks/bookmark-glyph.png" style="width:2%; margin:0px 0px;"> glyph in the ranked variants table, and the glyph will appear in the gene badge at the top of the page - if multiple genes are open - (<img src="/public/images/blog/bookmarks/gene-badge.png">), so you will always know which genes contain bookmarked variants.  

##Editing and exporting bookmarks  
From the \"Bookmarks\" panel at the left, bookmarks can be:

1. Selected; this will load the gene containing that variant and highlight the bookmarked variant,
2. Starred, allowing important variants to be identified among all the bookmarked variants,
3. Removed by clicking edit and then the red cross that appears next to the bookmark. <img src="/public/images/blog/bookmarks/bookmark-delete.png" style="width:45%; margin:20px 200px;">
4. Imported, which will be discussed in a later blog post,
5. Exported. When we\'ve finished analysis with gene.iobio, click on the \"Export\" button and we are given the option of exporting all variants, or just those that are starred. Choosing one of these options then opens a new tab, containing a text output of all the variants. This output includes not only positional information, but the ref and alt alleles, inheritance mode and gene. This file can then be saved, and can be imported back into gene.iobio at a later date.
