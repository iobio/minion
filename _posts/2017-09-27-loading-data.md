---
layout: post
title: Loading data into gene.iobio
image: /public/images/blog/loading_data/blog_image_data.jpg
subtitle: Loading your variant and alignment files
tags:
  - Tony DiSera
  - gene.iobio
---

Gene.iobio accesses variant and sequence alignment files to perform real-time analysis.  This blog post explains how to load your data files.

### File formats

#### VCF file ####
The main input to gene.iobio is the variant file.  You will need access to a VCF file that has been compressed and indexed.  If you have a VCF file, but it has not been compressed and indexed, you can learn more in the blog post [Compressing and indexing VCF files]({% post_url 2015-09-03-install-run-tabix %}).  The app will need access to both the compressed VCF and the index file.  For example, the demo variant data shown in gene.iobio uses these files:

<pre>
platinum-exome.vcf.gz
platinum-exome.vcf.gz.tbi
</pre>

#### BAM file (optional) ####
The other input to gene.iobio is the sequence alignment file, using the BAM format.  When provided, the sequence alignment files are used in the app to analyze coverage and call variants on-demand for genes of interest.  These are very large files and normally are stored in this binary form.  The app will need access to both the BAM file and its index file.  For example, the demo sequence alignment data for the proband uses these files:

<pre>
NA12878.exome.bam
NA12878.exome.bam.bai
</pre>

Occasionally, you might have access to the BAM files, but not the VCF files because the pipeline has yet to complete the variant calling step.  No problem.  You can load the BAM file(s) without the VCF files and the app will automatically call variants.


#### Bookmarked Variants file (optional) ####
Output from gene.iobio is stored in a comma separated or tab separated file.  This file contains any variants that have been
bookmarked in the app and represent the variants of interest that are being evaluated.  Please see the [gene 2.3.0 blog post]({% post_url 2017-04-26-gene_2.3.0 %}) to learn more about bookmarking variants.  There is also a <a href="https://youtu.be/JlXoBlWvniE" target="_new">Saving your Analysis video</a> that walks you through this functionality.


### Where is your data stored?

You can load data files into gene.iobio by either accessing the files from your local drive or from a URL if the files are accessible from a web server. For example, the demo data is stored on an Amazon S3 bucket, so the URL for the variant file looks like this:

<pre>
https://s3.amazonaws.com/iobio/samples/vcf/platinum-exome.vcf.gz
</pre>

In this case, the index file is stored in the same bucket. 
<pre>
https://s3.amazonaws.com/iobio/samples/vcf/platinum-exome.vcf.gz.tbi
</pre>

But if the index file is available from a different URL path, you can check the button 'Separate URL for index files' to specify the URL to the index file.

<div style="margin-top:80px;margin-bottom:80px">
	<hr style="border-width:5px; margin-left:100px; margin-right:100px;">
	<div style="margin-left:100px; margin-right:100px;">
	<h4>No lengthy upload required</h4>
	Gene.iobio streams data to the backend services in gene-sized chunks, so there you can start analyzing your data as soon
	as the files have been specified.
	</div>
	<hr style="border-width:5px; margin-left:100px; margin-right:100px;">
</div>

### The Files dialog

To specify your data files, click on the 'Files' link in the nav bar.

<div><img src="/public/images/blog/loading_data/nav_bar.png" style="width:80%;margin:0px 0px 25px 0px;"></div>

Specify your data files from the Files dialog.  

<div><img src="/public/images/blog/loading_data/files_dialog.png" style="width:100%; margin:0px 0px 15px 0px;"></div>

If your files are stored locally, selected 'Choose VCF file' from the 'Variants' dropdown.  

<div><img src="/public/images/blog/loading_data/choose_files.png" style="width:180px;margin:0px auto 15px 180px;"></div>


Then **_multi-select both_** the vcf.gz and the vcf.gz.tbi files.

<div><img src="/public/images/blog/loading_data/file_chooser.png" style="width:500px;margin:0px 0px 15px 0px;"></div>

For Trio analysis, specify the files for Mother and Father.  Additionally, you can specify affected and unaffected sibs.

<div><img src="/public/images/blog/loading_data/trio.png" style="width:100%; margin:0px 0px 15px 0px;"></div>

If you would like to load previously bookmarked variants, click on the 'Bookmark files' button and then specify the file format.  

<div><img src="/public/images/blog/loading_data/bookmark_files.png" style="width:80%; margin:0px 0px 15px 0px;"></div>

After the file is selected, the bookmarks will load and show in the left hand panel.

<div><img src="/public/images/blog/loading_data/bookmarks_loaded.png" class="shadow-z-2" style="width:300px; margin:0px 0px 15px 120px;"></div>

