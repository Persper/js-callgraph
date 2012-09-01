#!/usr/bin/perl

use Statistics::Descriptive;

$times = 10;  # run 10 times
$p = .1;      # truncate by ($p*100)% percent before taking the mean

$files = join(' ', @ARGV);
print "files to analyse: $files\n";

$parsing = Statistics::Descriptive::Full->new();
$bindings = Statistics::Descriptive::Full->new();
$flowgraph = Statistics::Descriptive::Full->new();
$callgraph = Statistics::Descriptive::Full->new();

for($i=1;$i<=$times;++$i) {
	print "run #$i\n";
	$data = `node main.js --time $files`;
	$parsing->add_data($1) if $data =~ /parsing: (\d+)ms/;
	$bindings->add_data($1) if $data =~ /bindings: (\d+)ms/;
	$flowgraph->add_data($1) if $data =~ /flowgraph: (\d+)ms/;
	$callgraph->add_data($1) if $data =~ /callgraph: (\d+)ms/;
}

print "\n";
printf "parsing  : %.2f seconds\n", ($parsing->trimmed_mean($p))/1000.0;
printf "bindings : %.2f seconds\n", ($bindings->trimmed_mean($p))/1000.0;
printf "flowgraph: %.2f seconds\n", ($flowgraph->trimmed_mean($p))/1000.0;
printf "callgraph: %.2f seconds\n", ($callgraph->trimmed_mean($p))/1000.0;
