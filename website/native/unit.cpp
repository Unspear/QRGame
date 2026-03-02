#include "api.hpp"
#include <fstream>
#include <string>
#include <iostream>
#include <sstream>
#include <filesystem>

int main() {
	// Create input file
	std::string input = "abacabadabacabaeabacabadabacabafabacabadabacabaeabacabadabacaba";
	std::ofstream inputFile("input.txt");
	inputFile << input;
	inputFile.close();
	// Round trip
	encode("input.txt", "compressed.pmd");
	decode("compressed.pmd", "output.txt");
	// Load output file
	std::ifstream outputFile("output.txt");
	std::ostringstream sstr;
	sstr << outputFile.rdbuf();
	std::string output = sstr.str();
	outputFile.close();
	std::cout << input << std::endl;
	std::cout << input.size() << " to " << std::filesystem::file_size("compressed.pmd") << " bytes" << std::endl;
	std::cout << output << std::endl;
}